import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import aiRoutes from './routes/ai.js';
import doctorRoutes from './routes/doctors.js';
import medicineRoutes from './routes/medicines.js';
import healthTipRoutes from './routes/healthTips.js';
import appointmentRoutes from './routes/appointments.js';
import reportRoutes from './routes/reports.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Medisage API is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/health-tips', healthTipRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);

// n8n automation overview endpoint
app.get('/api/n8n/webhooks', (req, res) => {
  res.json({
    webhooks: [
      { path: '/api/appointments/webhook/confirm', method: 'POST', description: 'n8n: Confirm appointment + send email' },
      { path: '/api/appointments/webhook/reminder', method: 'POST', description: 'n8n: Send appointment reminder' },
      { path: '/api/reports/webhook/generate-email', method: 'POST', description: 'n8n: Generate report PDF + email patient' },
    ],
    workflowSuggestions: [
      'Appointment Confirmation: Trigger -> Send Email -> Create Calendar Event -> Confirm Webhook',
      'Daily Reminders: Cron -> Check Tomorrow Appointments -> Send Reminder Email -> Reminder Webhook',
      'Report Generation: Post-Consultation -> Generate Report -> Store in MongoDB -> Email Patient -> Report Webhook',
    ],
  });
});

// Socket.IO real-time chat
io.on('connection', (socket) => {
  let userId = 'guest-' + socket.id;
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medisage_dev_secret');
      userId = decoded.id;
    } catch (err) {
      // keep guest
    }
  }
  socket.userId = userId;
  console.log('Socket connected:', socket.id, 'User:', userId);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user_joined', { userId: socket.userId, roomId });
  });

  socket.on('send_message', async (data) => {
    const { roomId, message, sender } = data;
    const payload = {
      id: `msg-${Date.now()}`,
      roomId,
      sender: sender || socket.userId,
      content: message,
      timestamp: new Date().toISOString(),
    };
    io.to(roomId).emit('receive_message', payload);

    if (socket.userId && !socket.userId.startsWith('guest-')) {
      try {
        const Chat = (await import('./models/Chat.js')).default;
        await Chat.findOneAndUpdate(
          { _id: roomId, user: socket.userId },
          { $push: { messages: payload }, $set: { updatedAt: new Date() } },
          { upsert: true, new: true }
        );
      } catch (e) {
        console.error('Socket save error:', e.message);
      }
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('typing', { userId: socket.userId, isTyping: data.isTyping });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Medisage server running on port ${PORT}`);
});

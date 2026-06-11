import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: String, required: true },
  triageLevel: { type: String, enum: ['low', 'moderate', 'high', 'urgent'] },
  suggestedMedicines: [{ type: Object }],
  recommendedDoctors: [{ type: Object }],
  followUpQuestions: [{ type: Object }],
  questionId: { type: String }, // n8n stateful triage question ID tracking
  assessment: { type: Object },
}, { _id: false });

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  userId: { type: String }, // string userId saved by n8n
  sessionId: { type: String }, // sessionId saved by n8n (corresponds to client chat _id)
  title: { type: String, default: 'New Consultation' },
  summary: { type: String, default: '' },
  isIncognito: { type: Boolean, default: false },
  messages: [messageSchema],
}, { timestamps: true, collection: 'healthcare_chats' });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;

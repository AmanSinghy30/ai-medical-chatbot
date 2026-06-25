import mongoose from 'mongoose';
import Chat from '../models/Chat.js';

export const getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all chats for this user (either user ref or userId string) that are NOT incognito
    const chats = await Chat.find({
      $and: [
        {
          $or: [
            { user: userId },
            { userId: userId }
          ]
        },
        { isIncognito: { $ne: true } }
      ]
    }).sort({ createdAt: -1 });

    const merged = [];
    const completedSessionIds = new Set();

    // Filter n8n completed chats and client active chats
    const n8nChats = chats.filter(c => c.sessionId && c.sessionId !== 'undefined');
    const clientChats = chats.filter(c => !c.sessionId || c.sessionId === 'undefined');

    for (const nc of n8nChats) {
      completedSessionIds.add(nc.sessionId);
      const cc = clientChats.find(c => c._id.toString() === nc.sessionId);
      if (cc) {
        merged.push({
          _id: cc._id,
          title: cc.title || nc.message || 'Consultation',
          summary: nc.assessment?.summary || nc.finalResponse?.summary || cc.summary || 'No summary available.',
          messages: cc.messages,
          assessment: nc.assessment || nc.finalResponse,
          answers: nc.answers,
          doctorRecommendations: nc.doctorRecommendations,
          createdAt: nc.createdAt || cc.createdAt,
          updatedAt: nc.updatedAt || cc.updatedAt,
          isCompleted: true
        });
      } else {
        merged.push({
          _id: nc._id,
          title: nc.message || 'Consultation',
          summary: nc.assessment?.summary || nc.finalResponse?.summary || 'No summary available.',
          messages: nc.answers?.map(a => ({
            role: 'assistant',
            content: `${a.question}\nAnswer: ${a.answerLabel || a.answerValue}`,
            timestamp: a.answeredAt
          })) || [],
          assessment: nc.assessment || nc.finalResponse,
          answers: nc.answers,
          doctorRecommendations: nc.doctorRecommendations,
          createdAt: nc.createdAt,
          updatedAt: nc.updatedAt,
          isCompleted: true
        });
      }
    }

    for (const cc of clientChats) {
      if (!completedSessionIds.has(cc._id.toString())) {
        merged.push({
          _id: cc._id,
          title: cc.title || 'Consultation',
          summary: cc.summary || 'Consultation saved. Click Resume to continue.',
          messages: cc.messages,
          createdAt: cc.createdAt,
          updatedAt: cc.updatedAt,
          isCompleted: false
        });
      }
    }

    merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(merged);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChatById = async (req, res) => {
  try {
    const userId = req.user.id;
    const chatId = req.params.id;

    const clientChat = await Chat.findOne({ _id: chatId, user: userId });
    const n8nChat = await Chat.findOne({ sessionId: chatId, userId: userId });

    if (!clientChat && !n8nChat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (clientChat && n8nChat) {
      return res.json({
        _id: clientChat._id,
        title: clientChat.title,
        summary: n8nChat.assessment?.summary || n8nChat.finalResponse?.summary || clientChat.summary,
        messages: clientChat.messages,
        assessment: n8nChat.assessment || n8nChat.finalResponse,
        answers: n8nChat.answers,
        doctorRecommendations: n8nChat.doctorRecommendations,
        createdAt: n8nChat.createdAt || clientChat.createdAt,
        updatedAt: n8nChat.updatedAt || clientChat.updatedAt,
        isCompleted: true
      });
    }

    if (clientChat) {
      return res.json({
        ...clientChat.toObject(),
        isCompleted: false
      });
    }

    res.json({
      ...n8nChat.toObject(),
      title: n8nChat.message || 'Consultation',
      isCompleted: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createChat = async (req, res) => {
  try {
    const { title, summary, isIncognito } = req.body;
    const chat = await Chat.create({
      user: req.user.id,
      userId: req.user.id, // Save both for Mongoose and n8n lookup consistency
      title: title || 'New Consultation',
      summary: summary || '',
      isIncognito: Boolean(isIncognito),
      messages: []
    });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = req.body;
    const chat = await Chat.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { $push: { messages: message }, $set: { updatedAt: new Date() } },
      { new: true }
    );
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Trigger n8n webhook asynchronously if configured
    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'new_message',
          chatId: chat._id,
          userId: req.user.id,
          message: message
        })
      }).catch(err => console.error('n8n webhook failed:', err.message));
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user?.id;
    
    // Find the chat first
    const chat = await Chat.findById(chatId);
    if (!chat) {
      // Also check if n8n completed chat exists with this sessionId
      const n8nChat = await Chat.findOne({ sessionId: chatId });
      if (n8nChat && (n8nChat.isIncognito || !userId)) {
        await Chat.deleteMany({ sessionId: chatId });
        await mongoose.connection.db.collection('healthcare_sessions').deleteMany({ sessionId: chatId });
        return res.json({ message: 'Temporary chat deleted' });
      }
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // If not logged in, only allow deletion if the chat is marked as incognito
    if (!userId && !chat.isIncognito) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // If logged in, make sure they own the chat (unless it is incognito)
    if (userId && chat.user && chat.user.toString() !== userId && !chat.isIncognito) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    await Chat.findOneAndDelete({ _id: chatId });
    await Chat.deleteMany({ sessionId: chatId });
    await mongoose.connection.db.collection('healthcare_sessions').deleteMany({ sessionId: chatId });
    
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

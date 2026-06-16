import Chat from '../models/Chat.js';

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user.id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createChat = async (req, res) => {
  try {
    const { title, summary } = req.body;
    const chat = await Chat.create({ user: req.user.id, title: title || 'New Consultation', summary: summary || '', messages: [] });
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
    await Chat.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

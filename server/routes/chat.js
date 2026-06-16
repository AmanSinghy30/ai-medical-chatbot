import express from 'express';
import { getChats, getChatById, createChat, addMessage, deleteChat } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getChats);
router.post('/', protect, createChat);
router.get('/:id', protect, getChatById);
router.post('/:id/messages', protect, addMessage);
router.delete('/:id', protect, deleteChat);

export default router;

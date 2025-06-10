import express from 'express';
const router = express.Router();
import { auth, isAuther } from '../Middleware/AuthMid.js';
import { askQuestion, getMessages, getConversations, deleteConversation } from '../controllers/chat.js';

router.post('/', auth, askQuestion);

router.get('/:conversationId/messages', auth, getMessages);

router.get('/conversations', auth, getConversations);

router.delete('/:conversationId', auth, isAuther, deleteConversation);

export default router;

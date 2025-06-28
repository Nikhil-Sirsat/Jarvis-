import express from 'express';
const router = express.Router();
import { auth, isAuther } from '../Middleware/AuthMid.js';
import { askQuestion, getMessages, getConversations, deleteConversation } from '../controllers/chat.js';
import { asyncHandler } from '../Middleware/asyncHandler.js';

router.post('/', auth, asyncHandler(askQuestion));

router.get('/:conversationId/messages', auth, asyncHandler(getMessages));

router.get('/conversations', auth, asyncHandler(getConversations));

router.delete('/:conversationId', auth, isAuther, asyncHandler(deleteConversation));

export default router;

import express from 'express';
const router = express.Router();
import { auth, isAuther } from '../Middleware/AuthMid.js';
import { askQuestion, getMessages, getConversations, deleteConversation } from '../controllers/chat.js';
import { asyncHandler } from '../Middleware/asyncHandler.js';
import { rateLimiter } from '../Utils/rateLimit.js';

router.post('/', auth, rateLimiter, asyncHandler(askQuestion));

router.get('/:conversationId/messages', auth, asyncHandler(getMessages));

router.get('/conversations', auth, asyncHandler(getConversations));

router.delete('/:conversationId', auth, isAuther, asyncHandler(deleteConversation));

export default router;

import express from 'express';
const router = express.Router();
import generateTitle from '../Utils/generateTitle.js';
import createContext from '../Utils/createContext.js';
import ChatMessage from '../models/ChatMessage.js';
import Conversation from '../models/Conversation.js';
import { auth, isAuther } from '../Middleware/AuthMid.js';
import ai from '../config/ai.js';

router.post('/', auth, async (req, res) => {
    const { message, conversationId } = req.body;
    const userId = req.user._id;

    try {
        let convoId = conversationId;
        let prevContext = 'you are an AI assistant named Jarvis created By Nikhil Sirsat';

        // If conversation exists, fetch it with current context
        let conversation;
        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({ error: 'Conversation not found' });
            }
            prevContext = conversation.context || '';
        } else {
            // Create new conversation if not provided
            conversation = new Conversation({ userId });

            const { title, status, err } = await generateTitle(message);
            conversation.title = title;
            await conversation.save();
            convoId = conversation._id;

            if (!status) {
                console.warn('Gemini failed to generate title, used fallback:', err?.message || err);
            }
        }

        // Construct full message for AI prompt
        const promptParts = [];

        if (prevContext) {
            promptParts.push({ text: `Context: ${prevContext}` });
        }

        promptParts.push({ text: `User: ${message}` });

        // Request to Gemini
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: promptParts,
        });

        const aiReply = response.text?.trim();

        if (!aiReply) {
            throw new Error('Empty AI reply');
        }

        // Save both messages
        const userMsg = new ChatMessage({
            conversationId: convoId,
            sender: 'user',
            message: message,
        });

        const aiMsg = new ChatMessage({
            conversationId: convoId,
            sender: 'ai',
            message: aiReply,
        });

        await userMsg.save();
        await aiMsg.save();

        // 🔁 Generate updated context and save to conversation
        const { newContext, status } = await createContext(prevContext, message, aiReply);

        if (status) {
            conversation.context = newContext;
            await conversation.save();
        } else {
            console.warn('Context update failed:', contextErr?.message || contextErr);
        }

        return res.status(200).json({ reply: aiReply, conversationId: convoId });
    } catch (err) {
        console.error('Chat route error:', err.message || err);
        return res.status(500).json({ error: 'Something went wrong with Gemini chat' });
    }
});

router.get('/:conversationId/messages', auth, async (req, res) => {
    try {
        const messages = await ChatMessage.find({
            conversationId: req.params.conversationId,
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

router.get('/conversations', auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const conversations = await Conversation.find({ userId: userId }).select('title').sort({ updatedAt: -1 });
        res.status(200).json(conversations);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

router.delete('/:conversationId', auth, isAuther, async (req, res) => {
    try {
        const { conversationId } = req.params;

        // Delete messages associated with the conversation
        await ChatMessage.deleteMany({ conversationId });

        // Delete the conversation itself
        await Conversation.findByIdAndDelete(conversationId);

        res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

export default router;

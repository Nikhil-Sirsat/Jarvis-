import generateTitle from '../Utils/generateTitle.js';
import createContext from '../Utils/createContext.js';
import ChatMessage from '../models/ChatMessage.js';
import Conversation from '../models/Conversation.js';
import ai from '../config/ai.js';
import ExpressError from '../Utils/ExpressError.js';

export const askQuestion = async (req, res) => {
    const { message, conversationId } = req.body;
    const userId = req.user._id;

    let convoId = conversationId;
    let prevContext = 'you are an AI assistant named Jarvis created By Nikhil Sirsat';

    // If conversation exists, fetch it with current context
    let conversation;
    if (conversationId) {
        conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            throw new ExpressError(404, 'Conversation not found');
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
        throw new ExpressError(500, 'AI did not return a valid response');
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
}

export const getMessages = async (req, res) => {
    const messages = await ChatMessage.find({
        conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 });

    return res.json(messages);
}

export const getConversations = async (req, res) => {
    const userId = req.user._id;
    const conversations = await Conversation.find({ userId: userId })
        .select('title')
        .sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
}

export const deleteConversation = async (req, res) => {
    const { conversationId } = req.params;

    // Delete messages associated with the conversation
    await ChatMessage.deleteMany({ conversationId });

    // Delete the conversation itself
    await Conversation.findByIdAndDelete(conversationId);

    return res.status(200).json({ message: 'Conversation deleted successfully' });
}
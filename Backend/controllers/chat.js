import generateTitle from '../Utils/generateTitle.js';
import ChatMessage from '../models/ChatMessage.js';
import Conversation from '../models/Conversation.js';
import ai from '../config/ai.js';
import ExpressError from '../Utils/ExpressError.js';
import { getCachedChatHistory, cacheChatMessage, cacheChatHistoryBulk } from '../Utils/redisHelper.js';

export const askQuestion = async (req, res) => {
    const { message, conversationId } = req.body;
    const userId = req.user._id;

    let convId = conversationId || null;
    let historyMessages = [];

    if (!convId) {
        // Create new conversation if not provided
        let conversation = new Conversation({ userId });

        const { title, status, err } = await generateTitle(message);
        conversation.title = title;
        await conversation.save();
        convId = conversation._id;

        if (!status) {
            console.warn('Gemini failed to generate title, used fallback:', err?.message || err);
        }
    } else {

        // Try Redis for history
        historyMessages = (await getCachedChatHistory(convId.toString()));

        console.log("historyMessages from Redis : ", historyMessages);

        // If Redis empty → fetch from DB and cache
        if (historyMessages.length === 0) {
            console.log("history length malformed : ", historyMessages);
            const dbMessages = await ChatMessage.find({ conversationId: convId })
                .sort({ createdAt: 1 })
                .select("sender message");
            historyMessages = dbMessages.map(m => ({ sender: m.sender, message: m.message }));
            await cacheChatHistoryBulk(convId.toString(), historyMessages);
        }
    }

    // If no messages in history, initialize as empty array
    if (!Array.isArray(historyMessages)) {
        historyMessages = [];
    }
    const promptParts = [
        { text: "You are Jarvis, an AI assistant created by Nikhil Sirsat." },
        ...historyMessages.map((msg) => ({
            text: `${msg.sender === "user" ? "user" : "ai"}: ${msg.message}`,
        })),
        { text: `Users next question : ${message}` },
    ];

    // Gemini response
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: promptParts,
    });

    const aiReply = response.text?.trim();
    if (!aiReply) { throw new ExpressError(500, 'AI did not return a valid response'); }

    // Save both messages
    await new ChatMessage({ conversationId: convId, sender: "user", message: message }).save();
    await new ChatMessage({ conversationId: convId, sender: "ai", message: aiReply }).save();

    // Push both to Redis (memory)
    await cacheChatMessage(convId.toString(), "user", message);
    await cacheChatMessage(convId.toString(), "ai", aiReply);

    return res.status(200).json({ reply: aiReply, conversationId: convId });
};

export const getMessages = async (req, res) => {
    const messages = await ChatMessage.find({
        conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 });

    return res.json(messages);
};

export const getConversations = async (req, res) => {
    const userId = req.user._id;
    const conversations = await Conversation.find({ userId: userId })
        .select('title')
        .sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
};

export const deleteConversation = async (req, res) => {
    const { conversationId } = req.params;

    // Delete messages associated with the conversation
    await ChatMessage.deleteMany({ conversationId });

    // Delete the conversation itself
    await Conversation.findByIdAndDelete(conversationId);

    return res.status(200).json({ message: 'Conversation deleted successfully' });
};
import ChatMessage from '../models/chatMessage.js';
import Conversation from '../models/conversation.js';
import ExpressError from '../Utils/ExpressError.js';
import { getCachedChatHistory, writeToChatCache } from '../Utils/redisHelper.js';
import { searchMemory, shouldStoreMemory } from '../memory/memoryUtils.js';
import { aiResponse, generateTitle, classifyMessageForMemoryAndSearch } from '../Utils/LLM.js';
import { pushToMemoryQueue } from '../memory/memoryQueue.js';
import { searchSerpAPI } from '../web/search.js';

export const askQuestion = async (req, res) => {
    const { message, conversationId } = req.body;

    if (!message) {
        throw new ExpressError(400, 'Message required');
    };

    const userId = req.user._id.toString();
    const user = req.user;

    let convId = conversationId || null;
    let historyMessages = [];

    // Conversation logic
    if (!convId) {
        // Create new conversation if not provided
        let conversation = new Conversation({ userId });

        const { title, status, err } = await generateTitle(message);
        conversation.title = title || 'new conv';
        await conversation.save();
        convId = conversation._id;

        if (!status) {
            console.warn('Gemini failed to generate title, used fallback:', err?.message || err);
        }
    } else {

        // Try Redis for history
        historyMessages = (await getCachedChatHistory(convId.toString()));

        // If Redis empty → fetch from DB and cache
        if (historyMessages.length === 0) {
            const dbMessages = await ChatMessage.find({ conversationId: convId })
                .sort({ createdAt: 1 })
                .limit(10)
                .select("sender message createdAt");
            historyMessages = dbMessages.map(m => ({ sender: m.sender, message: m.message, createdAt: m.createdAt }));

            await writeToChatCache(convId.toString(), historyMessages, { overwrite: true });
        }
    };

    // check weather Uesr message need memory and web search
    let webContext;
    let sourcesForUI = [];
    let relevantMemories = [];
    let lastLLMresponse;

    if (historyMessages.length > 0) {
        lastLLMresponse = historyMessages[historyMessages.length - 1].message;
    };

    let permissions = await classifyMessageForMemoryAndSearch(message, lastLLMresponse);

    // web search
    if (permissions.isWebSearchRequired === true) {
        let results = await searchSerpAPI(message);
        webContext = results.webContext;
        sourcesForUI = results.sourcesForUI;
    };

    // Memory search
    if (permissions.isMemoryRequired === true) {
        relevantMemories = await searchMemory(userId, message, 5);
    };

    // get ai response
    let aiReply = await aiResponse(user, relevantMemories, historyMessages, message, webContext);

    // save both messages
    let userMessage = await new ChatMessage({ conversationId: convId, sender: "user", message }).save();
    let aiMessage = await new ChatMessage({ conversationId: convId, sender: "ai", message: aiReply }).save();

    // Cache messages
    let userMsgCreatedAt = userMessage.createdAt;
    let aiMsgCreatedAt = aiMessage.createdAt;
    await writeToChatCache(convId, [{ sender: 'user', message, createdAt: userMsgCreatedAt }, { sender: 'ai', message: aiReply, createdAt: aiMsgCreatedAt }]);

    // memory push
    if (shouldStoreMemory(message)) {
        setImmediate(() => {
            pushToMemoryQueue({ userId, message });
        });
    };

    return res.status(200).json({ reply: aiReply, conversationId: convId, memoryUsed: relevantMemories, aiMsgId: aiMessage._id, sources: sourcesForUI });
};

export const getMessages = async (req, res) => {
    const messages = await ChatMessage.find({
        conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 });

    if (!messages || messages.length === 0) {
        throw new ExpressError(404, 'No messages found for this conversation');
    }

    return res.json(messages);
};

export const getConversations = async (req, res) => {
    const userId = req.user._id;
    const conversations = await Conversation.find({ userId: userId })
        .select('title updatedAt')
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
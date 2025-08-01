import ChatMessage from '../models/chatMessage.js';
import Conversation from '../models/conversation.js';
import ExpressError from '../Utils/ExpressError.js';
import { writeToChatCache } from '../Utils/redisHelper.js';
import { searchMemory, shouldStoreMemory } from '../memory/memoryUtils.js';
import { aiResponse, classifyMessageForMemoryAndSearch } from '../Utils/LLM.js';
import { pushToMemoryQueue } from '../memory/memoryQueue.js';
import { searchSerpAPI } from '../web/search.js';
import { getConvHistory, newConv } from '../Utils/conv.js';

export const askQuestion = async (req, res) => {
    const { message, conversationId, socketId } = req.body;

    console.log('socketId : ', socketId);

    const io = req.app.get('io'); // Get the io instance from the app

    let convId = conversationId || null;
    const user = req.user;
    const userId = user._id.toString();

    let convHistory = [];
    let webContext;
    let sourcesForUI = [];
    let relevantMemories = [];
    let lastLLMresponse;

    if (!message) {
        throw new ExpressError(400, 'Message required');
    };

    // Conversation logic
    if (!convId) {
        // Create new conversation 
        convId = await newConv(userId, message);
    } else {
        // Get conv History
        convHistory = await getConvHistory(convId);
    };

    // get last LLM response for follow Up question reference
    if (convHistory.length > 0) { lastLLMresponse = convHistory[convHistory.length - 1].message; };

    // LLM Call For Smart Decision Making (web search && memory search)
    let permissions = await classifyMessageForMemoryAndSearch(message, lastLLMresponse);

    // get clarified follow updated query for better web & memory search
    let clarifiedFollowupQuery = permissions.clarifiedFollowupQuery;

    // real time indicators for web and memory search
    if (permissions.isWebSearchRequired) { io.to(socketId).emit("web-search", { status: true }); };
    if (permissions.isMemoryRequired) { io.to(socketId).emit("memory-search", { status: true }); };

    await Promise.all([
        // Web Search
        permissions.isWebSearchRequired === true
            ? searchSerpAPI(clarifiedFollowupQuery || message).then(results => {
                webContext = results.webContext;
                sourcesForUI = results.sourcesForUI;
            })
            : null,

        // Memory Search
        permissions.isMemoryRequired === true
            ? searchMemory(userId, clarifiedFollowupQuery || message, 5).then(results => {
                relevantMemories = results;
            })
            : null
    ]);

    // get ai response
    let aiReply = await aiResponse(user, relevantMemories, convHistory, message, webContext);

    // timestamp of user message : 1 second earlier than ai
    const now = new Date();
    const userTimestamp = new Date(now.getTime() - 1000);

    const [userMessage, aiMessage, writtenCache] = await Promise.all([
        new ChatMessage({
            conversationId: convId, sender: "user", message, createdAt: userTimestamp,
            updatedAt: userTimestamp,
            timestamp: userTimestamp
        }).save(),

        new ChatMessage({
            conversationId: convId, sender: "ai", message: aiReply, createdAt: now,
            updatedAt: now,
            timestamp: now
        }).save(),

        // Cache messages
        writeToChatCache(convId, [{
            sender: 'user', message, createdAt: userTimestamp,
            updatedAt: userTimestamp,
            timestamp: userTimestamp
        }, {
            sender: 'ai', message: aiReply, createdAt: now,
            updatedAt: now,
            timestamp: now
        }])
    ]);

    // memory push if worth
    if (shouldStoreMemory(message)) {
        setImmediate(() => { pushToMemoryQueue({ userId, message }); });
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
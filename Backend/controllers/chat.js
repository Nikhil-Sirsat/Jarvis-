import generateTitle from '../Utils/generateTitle.js';
import ChatMessage from '../models/ChatMessage.js';
import Conversation from '../models/Conversation.js';
import ai from '../config/ai.js';
import ExpressError from '../Utils/ExpressError.js';
import { getCachedChatHistory, writeToChatCache } from '../Utils/redisHelper.js';
import { searchMemory, shouldStoreMemory, isMsgNeedMemories } from '../memory/memoryUtils.js';
import { pushToMemoryQueue } from '../memory/memoryQueue.js';

export const askQuestion = async (req, res) => {
    const { message, conversationId } = req.body;

    if (!message) {
        throw new ExpressError(400, 'Message required');
    }

    const userId = req.user._id.toString();
    const { nickname, userRole, traits, extraNotes } = req.user.persona || {};

    let convId = conversationId || null;
    let historyMessages = [];

    console.time('Total AskQuestion');

    // Conversation logic
    console.time('Conversation Setup');

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
    }

    // If no messages in history, initialize as empty array
    if (!Array.isArray(historyMessages)) { historyMessages = []; }

    console.timeEnd('Conversation Setup');

    // Memory search
    console.time('Search Memory');
    let relevantMemories = [];
    if (isMsgNeedMemories(message)) {
        relevantMemories = await searchMemory(userId, message, 5);
    }
    console.timeEnd('Search Memory');

    // personality prefix
    const personaPrefix = `
You are speaking to ${nickname || 'the user'}.
They are: ${userRole || 'a valued user'}.
Be ${traits?.join(', ') || 'friendly'}.
Notes: ${extraNotes || 'No extra instructions.'}
`;

    // Build Prompt
    const promptParts = [
        {
            text: `
            You are Jarvis, an intelligent, evolving AI created by Nikhil Sirsat.
Your goal is to assist ${nickname || 'user'} with clarity, speed, and accuracy.

Before answering:

Classify query as SIMPLE (direct/factual) or COMPLEX (requires reasoning).

SIMPLE → reply in 1–5 lines, no extra reasoning.

COMPLEX → use chain-of-thought: analyze intent → break down → reason → conclude accurately.

Always validate logic before final answer.

Respond with a clear, professional, and helpful tone.
`,
        },

        {
            text: personaPrefix,
        },

        ...(relevantMemories.length > 0
            ? [{ text: `some important memories about ${nickname || 'user'}: \n${relevantMemories.map(m => `- ${m}`).join('\n')}` }]
            : []),
        ...historyMessages.map((msg) => ({
            text: `${msg.sender === "user" ? "user" : "ai"}: ${msg.message}`,
        })),
        {
            text: `next question : ${nickname || 'User'}: ${message}`,
        },
    ];

    // Gemini Call
    console.time('Gemini API');
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: promptParts,
        generationConfig: {
            temperature: 0.4,
        },
    });
    console.timeEnd('Gemini API');

    const aiReply = response.text?.trim();
    if (!aiReply) { throw new ExpressError(500, 'AI did not return a valid response'); }

    // Parallel save both messages
    console.time('Save Messages');
    let userMessage = await new ChatMessage({ conversationId: convId, sender: "user", message }).save();
    let aiMessage = await new ChatMessage({ conversationId: convId, sender: "ai", message: aiReply }).save();
    console.timeEnd('Save Messages');

    console.time('catch Messages');
    // Cache messages
    let userMsgCreatedAt = userMessage.createdAt;
    let aiMsgCreatedAt = aiMessage.createdAt;
    await writeToChatCache(convId, [{ sender: 'user', message, createdAt: userMsgCreatedAt }, { sender: 'ai', message: aiReply, createdAt: aiMsgCreatedAt }]);
    console.timeEnd('catch Messages');

    // Async memory push
    if (shouldStoreMemory(message)) {
        setImmediate(() => {
            pushToMemoryQueue({ userId, message });
        });
    }

    console.timeEnd('Total AskQuestion');

    return res.status(200).json({ reply: aiReply, conversationId: convId, memoryUsed: relevantMemories, aiMsgId: aiMessage._id });
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

    if (!conversations || conversations.length === 0) {
        throw new ExpressError(404, 'No conversations found');
    }

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

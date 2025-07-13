import generateTitle from '../Utils/generateTitle.js';
import ChatMessage from '../models/ChatMessage.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import ai from '../config/ai.js';
import ExpressError from '../Utils/ExpressError.js';
import { getCachedChatHistory, cacheChatMessage, cacheChatHistoryBulk } from '../Utils/redisHelper.js';
import { searchMemory, shouldStoreMemory } from '../memory/memoryUtils.js';
import { pushToMemoryQueue } from '../memory/memoryQueue.js';

export const askQuestion = async (req, res) => {
    const { message, conversationId } = req.body;
    const userId = req.user._id.toString();

    const currUser = await User.findById(userId).select('name').lean();
    const userName = currUser.name;

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

        // If Redis empty → fetch from DB and cache
        if (historyMessages.length === 0) {
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

    //  Load Memory
    const relevantMemories = await searchMemory(userId, message, 5);

    // Build Prompt
    const promptParts = [
        {
            text: `
You are Jarvis, a highly intelligent, self-improving AI assistant built by Nikhil Sirsat and you are currently talking to ${userName}.
Your primary goal is to help the ${userName} as clearly, efficiently, and accurately as possible.

Before generating your answer:
1. Decide whether the user's question is SIMPLE (factual, direct, definitional) or COMPLEX (needs reasoning, breakdown, or multiple steps).
2. If it's SIMPLE — answer directly and concisely in 1-5 lines. Avoid unnecessary steps or reflections.
3. If it's COMPLEX — use a chain-of-thought approach: reflect on intent, break into logical steps, reason through each clearly, and synthesize a well-justified, accurate answer. Double-check before responding.
4. Always double-check your logic before giving the final response.

Keep your tone helpful and professional and present the information clearly.
`,
        },
        ...(relevantMemories.length > 0
            ? [{ text: `Here are some important memories about ${userName}: \n${relevantMemories.map(m => `- ${m}`).join('\n')}` }]
            : []),
        ...historyMessages.map((msg) => ({
            text: `${msg.sender === "user" ? "user" : "ai"}: ${msg.message}`,
        })),
        {
            text: ` Now, here is the ${userName}'s next question : User: ${message}`,
        },
    ];

    // Gemini response
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: promptParts,
        generationConfig: {
            temperature: 0.4,
        },
    });

    const aiReply = response.text?.trim();
    if (!aiReply) { throw new ExpressError(500, 'AI did not return a valid response'); }

    // Save both messages
    await new ChatMessage({ conversationId: convId, sender: "user", message: message }).save();
    await new ChatMessage({ conversationId: convId, sender: "ai", message: aiReply }).save();

    // Push both to Redis (memory)
    await cacheChatMessage(convId.toString(), "user", message);
    await cacheChatMessage(convId.toString(), "ai", aiReply);

    // Save to Memory if relevant
    if (shouldStoreMemory(message)) {
        await pushToMemoryQueue({ userId, message });
    }

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

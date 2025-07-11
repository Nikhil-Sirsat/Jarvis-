import generateTitle from '../Utils/generateTitle.js';
import ChatMessage from '../models/ChatMessage.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import ai from '../config/ai.js';
import ExpressError from '../Utils/ExpressError.js';
import { getCachedChatHistory, cacheChatMessage, cacheChatHistoryBulk } from '../Utils/redisHelper.js';

export const askQuestion = async (req, res) => {
    const { message, conversationId } = req.body;
    const userId = req.user._id;

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

        // console.log("historyMessages from Redis : ", historyMessages);

        // If Redis empty → fetch from DB and cache
        if (historyMessages.length === 0) {
            // console.log("history length malformed : ", historyMessages);
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

    // Intellegent Prompt Parts
    const promptParts = [
        {
            text: `
You are Jarvis, a highly intelligent, self-improving AI assistant built by Nikhil Sirsat and you are currently talking to ${userName}.
Your primary goal is to help the ${userName} as clearly, efficiently, and accurately as possible.

Before generating your answer:
1. Decide whether the user's question is SIMPLE (factual, direct, definitional) or COMPLEX (needs reasoning, breakdown, or multiple steps).
2. If it's SIMPLE — answer directly and concisely in 1-5 lines. Avoid unnecessary steps or reflections.
3. If it's COMPLEX — use a chain-of-thought approach: 
3.1. Analyze and deeply understand the user’s query.
3.2. Reflect on what the user might really mean.
3.3. Break the task down into multiple logical steps.
3.4. For each step, reason clearly and justify your logic.
3.5. Once all steps are verified, synthesize the best possible final answer.
3.6. Double-check your conclusion. If anything seems unclear or illogical, re-evaluate your steps before responding.
4. Always double-check your logic before giving the final response.

Keep your tone helpful and professional and present the information clearly.
`,
        },
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









// Intellegent Prompt Parts
//     const promptParts = [
//         {
//             text: `
// You are Jarvis, a highly intelligent, self-improving AI assistant built by Nikhil Sirsat.
// You are designed to reason, reflect, question yourself, and think like a chain of intelligent thoughts before delivering any answer.

// Your mission is to never rush to conclusions. Always follow this process:
// 1. Analyze and deeply understand the user’s query.
// 2. Reflect on what the user might really mean.
// 3. Break the task down into multiple logical steps.
// 4. For each step, reason clearly and justify your logic.
// 5. Once all steps are verified, synthesize the best possible final answer.
// 6. Double-check your conclusion. If anything seems unclear or illogical, re-evaluate your steps before responding.

// Only once your internal reasoning is fully sound, output your final answer with explanation.
// Be thoughtful, structured, and precise. Think like a human researcher combined with an autonomous planner.
// `,
//         },
//         ...historyMessages.map((msg) => ({
//             text: `${msg.sender === "user" ? "user" : "ai"}: ${msg.message}`,
//         })),
//         {
//             text: `
// Now, here is the ${userName}'s next question. Begin the chain-of-thought reasoning immediately:
// User: ${message}
// `,
//         },
//     ];
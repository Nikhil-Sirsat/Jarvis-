
import Conversation from "../models/conversation.js";
import { generateTitle } from "./LLM.js";
import ExpressError from "./ExpressError.js";
import { getCachedChatHistory, writeToChatCache } from "./redisHelper.js";
import ChatMessage from "../models/chatMessage.js";

// -----Create New Conv------------------------------------------
export const newConv = async (userId, message) => {
    try {
        let conversation = new Conversation({ userId });

        const { title, status, err } = await generateTitle(message);
        conversation.title = title || 'new conv';
        await conversation.save();
        let convId = conversation._id;

        if (!status) {
            console.warn('Gemini failed to generate title, used fallback:', err?.message || err);
        }

        return convId;
    } catch (error) {
        console.warn(`error in creatin new conv : ${error.response?.data?.message || error.message}`);
        throw new ExpressError(500, `Error Initializing new Conversation : ${error.response?.data?.message || error.message}`);
    }
};

//------Get Conv History------------------------------------------
export const getConvHistory = async (convId) => {
    try {
        let convHistory = [];

        // Try Redis for history
        // convHistory = (await getCachedChatHistory(convId.toString()));

        // If Redis empty → fetch from DB and cache
        if (convHistory.length === 0) {
            const dbMessages = await ChatMessage.find({ conversationId: convId })
                .sort({ createdAt: 1 })
                .limit(10)
                .select("sender message createdAt");
            convHistory = dbMessages.map(m => ({ sender: m.sender, message: m.message, createdAt: m.createdAt }));

            // await writeToChatCache(convId.toString(), convHistory, { overwrite: true });
        }

        return convHistory;
    } catch (error) {
        console.warn(`Error in catching conv history : ${error.response?.data?.message || error.message}`);
        return null;
    }
};
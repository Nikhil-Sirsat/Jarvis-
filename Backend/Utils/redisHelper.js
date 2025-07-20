// utils/redisMemory.js
import redis from '../config/redis.js';

const getChatHistoryKey = (conversationId) => `history:${conversationId}`;

// 1. Get chat history (no major changes here, but add guard)
export const getCachedChatHistory = async (conversationId) => {
    const key = getChatHistoryKey(conversationId);

    const rawHistory = await redis.lrange(key, 0, -1);
    const messages = [];

    for (let i = 0; i < rawHistory.length; i++) {
        try {
            // Defensive: If already an object, just push it
            if (typeof rawHistory[i] === "object") {
                messages.push(rawHistory[i]);
            } else {
                messages.push(JSON.parse(rawHistory[i]));
            }
        } catch (err) {
            console.error(`Error parsing Redis item at index ${i}:`, rawHistory[i]);
        }
    }
    return messages;
};

// 3. cach 
export const writeToChatCache = async (conversationId, messages, options = { overwrite: false }) => {
    const key = getChatHistoryKey(conversationId);
    if (!Array.isArray(messages) || messages.length === 0) return;

    try {
        const pipeline = redis.pipeline();
        if (options.overwrite) pipeline.del(key);

        const serialized = messages.map(m => JSON.stringify(m));
        pipeline.rpush(key, ...serialized);
        pipeline.expire(key, options.ttl || 900);
        await pipeline.exec();
    } catch (err) {
        console.error("writeToChatCache Redis error:", err);
    }
};



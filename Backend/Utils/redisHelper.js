// utils/redisMemory.js
import redis from '../config/redis.js';

const getChatHistoryKey = (conversationId) => `history:${conversationId}`;

// read chat history from redis
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

//cach a single chat message
export const cacheChatMessage = async (conversationId, sender, message) => {
    const key = getChatHistoryKey(conversationId);

    const entry = JSON.stringify({ sender, message });

    try {
        await redis.rpush(key, entry);       // This is now a valid JSON string
        await redis.expire(key, 900);       // 30 min TTL
        console.log(" Cached message to Redis");
    } catch (err) {
        console.error(" cacheChatMessage Redis error:", err);
    }
};

//  Save entire history
export const cacheChatHistoryBulk = async (conversationId, messages) => {
    const key = getChatHistoryKey(conversationId);

    try {
        await redis.del(key);
        if (Array.isArray(messages) && messages.length > 0) {
            await redis.rpush(
                key,
                ...messages.map(m => JSON.stringify(m))
            );
            await redis.expire(key, 900); // Set TTL to 30 minutes
        }
    } catch (err) {
        console.error(' cacheChatHistoryBulk error:', err);
    }
};

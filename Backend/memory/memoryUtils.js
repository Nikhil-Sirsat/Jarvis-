import { client } from './vectorClient.js';
import { getEmbedding } from './embedding.js';
import { v4 as uuidv4 } from 'uuid';
const COLLECTION_NAME = 'jarvis_memory';
import ExpressError from '../Utils/ExpressError.js';

import ai from '../config/ai.js';

const memoryTriggers = [
    'remember',
    'note that',
    'i like',
    'i love',
    'my name is',
    'call me',
    'goal',
    'my goal',
    'i want to',
    'i want',
    'wanted',
    'my dream is',
    'i prefer',
    'i usually',
    'i have',
    'i’m working on',
    'i’m learning',
    'don’t forget',
    'save this',
    'important',
    'live',
];

// Store memory
export async function storeMemory(userId, text) {
    try {
        const vector = await getEmbedding(text);

        if (!vector || vector.length !== 384) {
            throw new ExpressError(500, "Invalid embedding vector received for query.");
        }

        // 1. Check if User exceed the limit of storing memory which is (60)
        const allMemory = await getAllVectorMemory(userId);
        if (allMemory.length >= 60) {
            console.log("Memory limit reached for user, skipping store.");
            return; // Stop storing if limit reached
        }

        // 2. Check for similar memory for this user
        const similar = await client.search(COLLECTION_NAME, {
            vector,
            limit: 3, // check top 3 similar
            score_threshold: 0.7, // only consider very similar (adjust as needed)
            filter: {
                must: [
                    {
                        key: 'userId',
                        match: { value: userId },
                    },
                ],
            },
        });

        if (similar && similar.length > 0) {
            console.log("Duplicate or highly similar memory detected, skipping store.");
            return; // Prevent duplicate entry
        }

        const id = uuidv4();

        await client.upsert(COLLECTION_NAME, {
            points: [
                {
                    id,
                    vector,
                    payload: {
                        userId,
                        text,
                        timestamp: new Date().toISOString()
                    },
                },
            ],
        });

        console.log("memory Stored");
    } catch (error) {
        throw new ExpressError(500, "Error in Storing Qdrant");
    }
};

// Search memory
export async function searchMemory(userId, query, topK = 5) {
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const vector = await getEmbedding(query);

            if (!vector || vector.length !== 384) {
                throw new ExpressError(400, "Invalid embedding vector received for query.");
            }

            const result = await client.search(COLLECTION_NAME, {
                vector,
                limit: topK,
                filter: {
                    must: [
                        {
                            key: 'userId',
                            match: { value: userId },
                        },
                    ],
                },
            });

            // console.log("fetched memory : ", result.map(item => item.payload.text));
            return result.map(item => item.payload.text);
        } catch (error) {
            lastError = error;
            console.warn(`Qdrant search attempt ${attempt} failed:`, error.message || error);
            // Wait a bit before retrying
            await new Promise(res => setTimeout(res, 300 * attempt));
        }
    }
    throw new ExpressError(500, "Error in Searching Qdrant: " + (lastError?.message));
};

// check weather to store in memory or not
export function shouldStoreMemory(text) {
    const lower = text.toLowerCase();
    const hasMemoryTrigger = memoryTriggers.some(trigger => lower.includes(trigger));
    const isLongEnough = lower.length > 30;

    return hasMemoryTrigger || isLongEnough;
}

export const validateMemoryLLM = async (text) => {
    console.log('is memory valid LLM called');
    const prompt = `
    You are Jarvis, a highly intelligent assistant managing long-term memory.

The user just said: 
"${text}"

Your task is to decide if this message contains **useful long-term memory information** that will help you personalize future conversations with the user.

 You should store the message ONLY IF it contains:
- personal facts (e.g., "my name is...", "I live in...", "I want to...")
- preferences (e.g., "I like...", "I enjoy...", "I prefer...")
- goals or plans (e.g., "I want to become a...", "I plan to...")
- opinions (e.g., "I believe that...", "I hate...")
- past actions or achievements (e.g., "I built...", "I studied...")

 Do NOT store if the message is:
- a general question or help request (e.g., "what should I build next?", "suggest me a project")
- vague or speculative (e.g., "maybe I should learn React")
- small talk (e.g., "how are you?")
- commands or task requests (e.g., "tell me a joke", "summarize this")

Be strict. Do not guess.

If YES:
→ Convert it into a third-person factual format like:
  - "User has a goal to become a software engineer."
  - "User prefers working at night."
  - "User has already built an app called LinkSpace."
  and return exactly only the converted message and no extra text.

If NO:
→ Reply exactly with "NO".`;

    const res = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: prompt,
        generationConfig: { temperature: 0.2 },
    });

    const data = res.text?.trim();

    if (!data || data.toUpperCase() === "NO") return null;

    return data;
};

export const getAllVectorMemory = async (userId) => {
    try {
        const result = await client.scroll(COLLECTION_NAME, {
            filter: {
                must: [
                    {
                        key: 'userId',
                        match: { value: userId },
                    },
                ],
            },
            limit: 100, // or any reasonable number
        });

        // console.log("all vec memo : ", result.points.map(item => item.payload.text));
        return result.points;
    } catch (error) {
        console.error("Error fetching all vector memory:", error);
        throw new ExpressError(500, "Error fetching all vector memory");
    }
};

export const getMemoryById = async (memoryId, userId) => {
    try {
        const result = await client.retrieve(COLLECTION_NAME, {
            ids: [memoryId],
        });
        if (result && result.length > 0) {
            // console.log('Fetched memory by ID:', result[0]);
            if (result[0].payload && result[0].payload.userId !== userId) {
                throw new ExpressError(404, "Memory not found or does not belong to this user");
            }
            return result[0];
        }
        return null;
    } catch (error) {
        console.error("Error fetching memory by ID:", error);
        throw new ExpressError(500, "Error fetching memory by ID");
    }
};

export const deleteMemoryById = async (memoryId) => {
    try {
        await client.delete(COLLECTION_NAME, {
            points: [memoryId],
        });
        return true;
    } catch (error) {
        console.error("Error deleting memory by ID:", error);
        throw new ExpressError(500, "Error deleting memory by ID");
    }
};

export async function getMemoryByUserIdWithinDays(userId, days = 7) {

    try {
        const sinceTimestamp = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        // console.log("Fetching memories for user:", userId, "since:", sinceTimestamp);

        const searchResult = await client.scroll(COLLECTION_NAME, {
            filter: {
                must: [
                    { key: 'userId', match: { value: userId } },
                    { key: 'timestamp', range: { gte: sinceTimestamp } }
                ]
            },
            limit: 100,
            with_payload: true,
        });

        // console.log("Fetched memory within days:", searchResult.points.map(item => item.payload.text));

        return searchResult.points || [];
    } catch (error) {
        console.error("Error fetching memories:", error);
        throw new ExpressError("Error fetching memories");
    }
};

export async function callLLMForReflection(memoryTexts) {

    try {

        // console.log("Calling LLM for reflection with memories:", memoryTexts);

        const prompt = `
You are JARVIS, an intelligent assistant.
The user has shared the following thoughts/memories over the past week:

${memoryTexts.map((text, i) => `${i + 1}. "${text}"`).join('\n')}

Based on this:
1. Give a short 4-5 sentence summary of what the user has been focused on.
2. Identify 2-3 key themes from their thoughts.
3. Suggest 3-4 helpful AI-generated suggestions to help them next week.
Output in JSON format like:
{
  "summary": "...",
  "themes": ["Theme1", "Theme2"],
  "suggestions": ["Suggestion1", "Suggestion2"]
}
`;

        const res = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt,
            generationConfig: { temperature: 0.3 },
        });

        let data = res.text?.trim();

        // Remove Markdown code block if present
        if (data.startsWith("```")) {
            data = data.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
        }

        // console.log("Reflection LLM response:", data);

        return JSON.parse(data); // Gemini returns raw JSON text
    } catch (error) {
        console.error("Error calling LLM for reflection:", error);
        throw new ExpressError("Error calling LLM for reflection");
    }

};


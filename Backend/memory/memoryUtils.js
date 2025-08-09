import { client } from '../config/qdrant.js';
import { getEmbedding } from './embedding.js';
import { v4 as uuidv4 } from 'uuid';
const COLLECTION_NAME = 'jarvis_memory';
import ExpressError from '../Utils/ExpressError.js';
import { cosineSimilarity } from '../Utils/cosineSimilarity.js';
import { mergeDuplicateMemory } from '../Utils/LLM.js';

// arr for checking weather the message is worth store in vector memories or not
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
            score_threshold: 0.7, // only consider very similar
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

        // console.log("memory Stored");
    } catch (error) {
        throw new ExpressError(500, "Error in Storing Qdrant");
    }
};

// Search memory
export async function searchMemory(userId, query, topK = 7) {
    const vector = await getEmbedding(query);
    if (!vector || vector.length !== 384) {
        throw new ExpressError(400, "Invalid embedding vector received for query.");
    }

    console.time('search memory');
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const raw = await client.search(COLLECTION_NAME, {
                vector,
                limit: topK,
                filter: {
                    must: [
                        { key: 'userId', match: { value: userId } }
                    ],
                },
                with_vector: true, // to compare between results
            });

            // normalize result shape 
            const hits = Array.isArray(raw) ? raw : (raw?.result ?? raw?.data ?? []);
            if (!Array.isArray(hits)) {
                throw new ExpressError(500, "'Unexpected Qdrant response shape.");
            }

            // Deduplicate by checking similarity between retrieved results
            const deduped = [];
            for (let h of raw) {
                const itemVec = h.vector ?? h.payload?.vector ?? h.payload?.embedding ?? null;
                if (!itemVec) {
                    console.warn(`searchMemory: point id=${h.id} missing vector — skipping this hit`);
                    continue; // skip items without vectors
                }

                const isDuplicate = deduped.some(existing => {
                    try {
                        return cosineSimilarity(existing.vector, itemVec) > 0.9;
                    } catch (e) {
                        console.warn('cosine check failed for id=', h.id, e.message);
                        return false;
                    }
                });

                if (!isDuplicate) {
                    deduped.push({ id: h.id, vector: itemVec, payload: h.payload });
                }
            }

            // topK after deduplication
            let final = deduped.slice(0, topK).map(x => x.payload?.text ?? x.payload?.content ?? '');

            if (final.length > 1) {

                let mergedMemories = await mergeDuplicateMemory(final);

                final = [mergedMemories];
            }

            console.timeEnd('search memory');
            return final;

        } catch (error) {
            lastError = error;
            console.warn(`Qdrant search attempt ${attempt} failed:`, error.message || error);
            await new Promise(res => setTimeout(res, 300 * attempt));
        }
    }
    throw new ExpressError(500, "Error in Searching Qdrant: " + (lastError?.message));
}

// check weather to store in memory or not
export function shouldStoreMemory(text) {
    const lower = text.toLowerCase();
    const hasMemoryTrigger = memoryTriggers.some(trigger => lower.includes(trigger));
    const isLongEnough = lower.length > 30;

    return hasMemoryTrigger || isLongEnough;
};

export const getAllVectorMemory = async (userId) => {
    try {
        const raw = await client.scroll(COLLECTION_NAME, {
            filter: {
                must: [
                    {
                        key: 'userId',
                        match: { value: userId },
                    },
                ],
            },
            limit: 100,
        });

        // console.log("all vec memo : ", raw.points.map(h => h.payload.text));
        return raw.points;
    } catch (error) {
        console.error("Error fetching all vector memory:", error);
        throw new ExpressError(500, "Error fetching all vector memory");
    }
};

export const getMemoryById = async (memoryId, userId) => {
    try {
        const raw = await client.retrieve(COLLECTION_NAME, {
            ids: [memoryId],
        });
        if (raw && raw.length > 0) {
            // console.log('Fetched memory by ID:', raw[0]);
            if (raw[0].payload && raw[0].payload.userId !== userId) {
                throw new ExpressError(404, "Memory not found or does not belong to this user");
            }
            return raw[0];
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

        // console.log("Fetched memory within days:", searchResult.points.map(h => h.payload.text));

        return searchResult.points || [];
    } catch (error) {
        console.error("Error fetching memories:", error);
        return null;
    }
};


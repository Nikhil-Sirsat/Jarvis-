import { client } from './vectorClient.js';
import { getEmbedding } from './embedding.js';
import { v4 as uuidv4 } from 'uuid';
const COLLECTION_NAME = 'jarvis_memory';
import ExpressError from '../Utils/ExpressError.js';

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
            throw new ExpressError("Invalid embedding vector received for query.");
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
                        timestamp: Date.now(),
                    },
                },
            ],
        });

        console.log("memory Stored");
    } catch (error) {
        throw new ExpressError("Error in Storing Qdrant");
    }

}

// Search memory
export async function searchMemory(userId, query, topK = 5) {

    try {
        const vector = await getEmbedding(query);

        if (!vector || vector.length !== 384) {
            throw new ExpressError("Invalid embedding vector received for query.");
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

        console.log("fetched memory : ", result.map(item => item.payload.text));

        return result.map(item => item.payload.text);
    } catch (error) {
        throw new ExpressError("Error in Searching Qdrant ");

    }

}

// check weather to store in memory or not
export function shouldStoreMemory(text) {
    const lower = text.toLowerCase();
    const hasMemoryTrigger = memoryTriggers.some(trigger => lower.includes(trigger));
    const isLongEnough = lower.length > 30;

    console.log('should Store : ', hasMemoryTrigger || isLongEnough);

    return hasMemoryTrigger || isLongEnough;
}


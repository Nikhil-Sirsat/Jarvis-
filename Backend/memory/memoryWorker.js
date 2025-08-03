import dotenv from 'dotenv';
dotenv.config();

import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { storeMemory } from './memoryUtils.js';
import { validateMemoryLLM } from '../Utils/LLM.js';

const isDev = process.env.NODE_ENV !== 'production';

const connection = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_TOKEN,
    username: process.env.REDIS_USERNAME,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

const subscriber = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_TOKEN,
    username: process.env.REDIS_USERNAME,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

const memoryWorker = new Worker(
    'memory-validation',
    async job => {
        const { userId, message } = job.data;
        console.log(`[Worker] Processing job for user ${userId}`);
        const canonicalMemory = await validateMemoryLLM(message);
        if (!canonicalMemory) return;
        await storeMemory(userId, canonicalMemory);
    },
    {
        connection,
        autorun: false,
        drainDelay: isDev ? 15000 : 5000,
    }
);

(async () => {
    await memoryWorker.waitUntilReady();
    memoryWorker.run();

    console.log('[Worker] Started and ready.');

    // Subscribe to wake channel (correct handler)
    await subscriber.subscribe('memory-worker:wake');
    subscriber.on('message', async (channel, message) => {
        if (channel === 'memory-worker:wake' && memoryWorker.isPaused()) {
            console.log('[Worker] Wake signal received via pub/sub. Resuming...');
            await memoryWorker.resume();
        }
    });

    // Pause after queue drains
    memoryWorker.on('drained', async () => {
        console.log('[Worker] Queue drained. Pausing...');
        await memoryWorker.pause();
    });

    // Local wake if in same process
    memoryWorker.on('waiting', async () => {
        if (memoryWorker.isPaused()) {
            console.log('[Worker] Local waiting event. Resuming...');
            await memoryWorker.resume();
        }
    });
})();

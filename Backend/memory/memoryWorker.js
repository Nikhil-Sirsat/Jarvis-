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

const memoryWorker = new Worker(
    'memory-validation',
    async job => {
        const { userId, message } = job.data;

        const canonicalMemory = await validateMemoryLLM(message);
        if (!canonicalMemory) return;

        await storeMemory(userId, canonicalMemory);
    },
    {
        connection,
        autorun: false, // Don't start polling automatically
        drainDelay: isDev ? 15000 : 5000, // Poll less often in dev
    }
);

(async () => {
    await memoryWorker.waitUntilReady();
    memoryWorker.run();

    // Auto-pause after queue is empty
    memoryWorker.on('drained', async () => {
        console.log('[Worker] Queue drained. Pausing...');
        await memoryWorker.pause();

        //Periodically check wake flag when paused
        const wakeCheck = setInterval(async () => {
            if (!memoryWorker.isPaused()) {
                clearInterval(wakeCheck);
                return;
            }

            const shouldWake = await connection.get('memory-worker:wake');
            if (shouldWake) {
                console.log('[Worker] Wake flag detected. Resuming...');
                clearInterval(wakeCheck);
                await connection.del('memory-worker:wake');
                await memoryWorker.resume();
            }
        }, 2000); // check every 2s when idle
    });

    // Auto-resume when new job arrives
    memoryWorker.on('waiting', async () => {
        if (memoryWorker.isPaused()) {
            console.log('[Worker] New job detected. Resuming...');
            memoryWorker.resume();
        }
    });
})();

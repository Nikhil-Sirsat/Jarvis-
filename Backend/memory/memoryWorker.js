import dotenv from 'dotenv';
dotenv.config();

import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { storeMemory } from './memoryUtils.js';
import { validateMemoryLLM } from '../Utils/AI.js';

const connection = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_TOKEN,
    username: process.env.REDIS_USERNAME,
    tls: {},
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

const memoryWorker = new Worker(
    'memory-validation',
    async job => {
        const { userId, message } = job.data;

        const canonicalMemory = await validateMemoryLLM(message);

        console.log('isStored : ', canonicalMemory);

        if (!canonicalMemory) return;

        await storeMemory(userId, canonicalMemory);


    },
    { connection }
);

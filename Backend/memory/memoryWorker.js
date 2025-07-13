import dotenv from 'dotenv';
dotenv.config();

import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { storeMemory, validateMemoryLLM } from './memoryUtils.js';

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

        console.log('memory worker is working');

        const isValid = await validateMemoryLLM(message);
        console.log('isStored : ', isValid);
        if (!isValid) return;

        await storeMemory(userId, message);


    },
    { connection }
);

import dotenv from 'dotenv';
dotenv.config();
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_TOKEN,
    username: process.env.REDIS_USERNAME,
    tls: {},
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

export const memoryQueue = new Queue('memory-validation', { connection });

export const pushToMemoryQueue = async (data) => {
    await memoryQueue.add(
        'validate-and-store',
        data,
        {
            attempts: 3, // Retry job up to 3 times if it fails
            backoff: {
                type: 'exponential', // exponential backoff
                delay: 500,          // start with 500ms delay
            },
            removeOnComplete: true, // auto-remove job after success
            removeOnFail: false     // keep failed jobs for inspection
        }
    );
};

import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// utils/redisClient.js
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
});

export default redis;


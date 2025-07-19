import redis from '../config/redis.js';
import ExpressError from './ExpressError.js';

const DAILY_LIMIT = 50;

export const rateLimiter = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const now = new Date();
        const key = `rate:${userId}:${now.toISOString().split('T')[0]}`;

        // Daily limit
        const dailyCount = await redis.incr(key);
        if (dailyCount === 1) {
            await redis.expire(key, 24 * 60 * 60); // expire in 24 hours
        }

        if (dailyCount > DAILY_LIMIT) {
            throw new ExpressError(429, 'Rate limit exceeded. Please try again later.');
        }

        // Attach remaining limits to headers
        res.set('X-RateLimit-Remaining-Day', Math.max(0, DAILY_LIMIT - dailyCount));

        next();

    } catch (err) {
        console.error('Rate Limiting Error:', err);
        throw new ExpressError(500, 'Rate limiting error occurred');
    }
};

import User from '../models/user.js';
import ExpressError from '../Utils/ExpressError.js';
import { getAllVectorMemory, getMemoryById, deleteMemoryById, getMemoryByUserIdWithinDays } from '../memory/memoryUtils.js';
import { callLLMForReflection, ProactiveSuggestion } from '../Utils/LLM.js';
import redis from '../config/redis.js';
import dayjs from 'dayjs';

const REDIS_TTL_SECONDS = 6 * 60 * 60; // 6 hours

export const signUp = async (req, res) => {
    let { name, email, age, password } = req.body;
    const newUser = new User({ name, email, age });
    await User.register(newUser, password);
    return res.status(201).json({ message: 'User registered successfully' });
};

export const login = (req, res) => {
    console.log('login req hit');
    return res.status(200).json({ user: req.user, message: 'Login successful' });
};

export const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            throw new ExpressError(500, 'Logout failed: ' + (err.message));
        }
        return res.status(200).json({ message: 'Logout successful' });
    });
};

export const protectedRoute = (req, res) => {
    return res.status(200).json({ user: req.user, message: 'This is a protected route' });
};

export const setPersona = async (req, res) => {
    const userId = req.user._id;
    const { nickname, userRole, traits, extraNotes } = req.body;

    await User.findByIdAndUpdate(userId, {
        persona: { nickname, userRole, traits, extraNotes }
    });

    res.status(200).json({ message: "Persona updated successfully" });
};


//memory controllers
export const getMemory = async (req, res) => {
    const userId = req.user._id.toString();

    const memory = await getAllVectorMemory(userId);

    return res.status(200).json({ memory: memory });
};

export const deleteOneMemory = async (req, res) => {
    const memoryId = req.params.id.toString();
    const userId = req.user._id.toString();

    const memory = await getMemoryById(memoryId, userId);
    if (!memory) {
        throw new ExpressError(404, 'Memory not found');
    }

    if (memory.payload.userId !== userId) {
        throw new ExpressError(403, 'Unauthorized access to delete this memory');
    }

    await deleteMemoryById(memoryId);
    return res.status(200).json({ message: 'Memory deleted successfully' });
};

export const getReflection = async (req, res) => {
    const { userId } = req.params;
    // console.log('req hit for reflection');

    // Validate userId
    if (!userId || userId !== req.user._id.toString()) {
        throw new ExpressError(403, 'Unauthorized access to reflection');
    }

    // Get vector memories from the past 7 days
    const memories = await getMemoryByUserIdWithinDays(userId, 7);

    if (!memories.length) {
        return res.status(200).json({
            summary: "No memories found for this week.",
            themes: [],
            suggestions: [],
            memoriesUsed: [],
        });
    }

    const memoryTexts = memories.map((m) => m.payload.text);

    const reflection = await callLLMForReflection(memoryTexts);

    return res.status(200).json({
        summary: reflection.summary,
        themes: reflection.themes,
        suggestions: reflection.suggestions,
        memoriesUsed: memories,
    });
};

// proactive suggestion 
export const getProactiveSuggestions = async (req, res) => {
    const userId = req.user._id;

    const redisKey = `proactive_suggestions:${userId}`;
    const cached = await redis.get(redisKey);

    if (cached) {
        return res.json({
            fromCache: true,
            ...cached
        });
    }

    // Get vector memories from the past 7 days
    const memories = await getMemoryByUserIdWithinDays(userId, 7);
    if (!memories.length) { return res.status(404).json({ message: "No memories found for this week for Generating Proactive Suggestions." }); };

    const memoryTexts = memories.map((m) => m.payload.text);

    const suggestions = await ProactiveSuggestion(memoryTexts);

    if (!suggestions) { return res.status(500).json({ message: "Error in Generating Proactive Suggestion" }) };

    const result = {
        userId,
        suggestions,
        generatedAt: dayjs().toISOString()
    };

    // Save to Redis with TTL
    await redis.set(redisKey, JSON.stringify(result), {
        ex: REDIS_TTL_SECONDS
    });

    res.json({
        fromCache: false,
        ...result
    });
};


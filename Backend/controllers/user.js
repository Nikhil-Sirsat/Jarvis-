import User from '../models/User.js';
import ExpressError from '../Utils/ExpressError.js';
import { getAllVectorMemory } from '../memory/memoryUtils.js';
import { client } from '../memory/vectorClient.js';

export const signUp = async (req, res) => {
    let { name, email, age, password } = req.body;
    const newUser = new User({ name, email, age });
    await User.register(newUser, password);
    return res.status(201).json({ message: 'User registered successfully' });
}

export const login = (req, res) => {
    console.log('login req hit');
    return res.status(200).json({ user: req.user, message: 'Login successful' });
}

export const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            throw new ExpressError(500, 'Logout failed: ' + (err.message || err));
        }
        return res.status(200).json({ message: 'Logout successful' });
    });
}

export const protectedRoute = (req, res) => {
    return res.status(200).json({ user: req.user, message: 'This is a protected route' });
}

export const getMemory = async (req, res) => {
    const userId = req.user._id.toString();

    try {
        const memory = await getAllVectorMemory(userId);

        return res.status(200).json({ memory: memory });
    } catch (error) {
        throw new ExpressError(500, 'Error fetching memory: ' + (error.message || error));
    }
}
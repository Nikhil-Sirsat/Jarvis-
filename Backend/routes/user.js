import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import passport from 'passport';
import { auth } from '../Middleware/AuthMid.js';
import { validateUser } from '../Middleware/ValidationMid.js';

// signup
router.post('/SignUp', validateUser, async (req, res) => {
    try {
        let { name, email, age, password } = req.body;
        const newUser = new User({ name, email, age });
        await User.register(newUser, password);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login 
router.post('/Login', passport.authenticate('local'), async (req, res) => {
    console.log('login req hit');
    res.status(200).json({ user: req.user, message: 'Login successful' });
});

// logOut
router.get('/Logout', auth, (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
});

// protected
router.get('/protected', auth, async (req, res) => {
    res.status(200).json({ user: req.user, message: 'This is a protected route' });
});

export default router;
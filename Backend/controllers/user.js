import User from '../models/User.js';

export const signUp = async (req, res) => {
    try {
        let { name, email, age, password } = req.body;
        const newUser = new User({ name, email, age });
        await User.register(newUser, password);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const login = (req, res) => {
    console.log('login req hit');
    res.status(200).json({ user: req.user, message: 'Login successful' });
}

export const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
}

export const protectedRoute = (req, res) => {
    res.status(200).json({ user: req.user, message: 'This is a protected route' });
}
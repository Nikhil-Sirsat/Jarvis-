import dotenv from 'dotenv';

if (process.env.NODE_ENV != "production") {
    dotenv.config();
}

import express from 'express';
import mongoose from 'mongoose';

import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

// import routes
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';

// import models
import User from './models/User.js';

import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session setup
const sessionMiddleware = session({
    secret: process.env.express_session_key,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
});
app.use(sessionMiddleware);

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// database setup
const MONGO_URL = process.env.DB_URL

mongoose.connect(MONGO_URL, {
}).then(() => {
    console.log("DB connected successfully!");
}).catch((err) => {
    console.error("DB connection error:", err);
});

// home 
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

app.listen(PORT, () => {
    console.log(`server live on port : ${PORT}`);
});
import dotenv from 'dotenv';

if (process.env.NODE_ENV != "production") {
    dotenv.config();
}

import express from 'express';

import connectDB from './ConnectDB/connectDB.js';

import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import compression from 'compression';

// import routes
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';
import favouriteRoutes from './routes/favourite.js';

// import models
import User from './models/User.js';

// import error handler
import errorHandler from './Middleware/errorHandler.js';

import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));

// MIDDLEWARES

//compression middleware
app.use(
    compression({
        level: 6, // 1 (fastest) to 9 (best compression)
        threshold: 1024, // Only compress responses > 1KB
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                // Don't compress if this header is present
                return false;
            }
            return compression.filter(req, res);
        },
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session middleware
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

// PASSPORT SETUP
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// database connection
connectDB();

// ROUTES
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/favourite', favouriteRoutes);

// error handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server live on port : ${PORT}`);
});
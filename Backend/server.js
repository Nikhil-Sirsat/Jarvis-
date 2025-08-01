import dotenv from 'dotenv';

if (process.env.NODE_ENV != "production") {
    dotenv.config();
}

import express from 'express';
import { createServer } from 'http';

import connectDB from './connectDB/connectDB.js';
import MongoStore from 'connect-mongo';

import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import compression from 'compression';

// socket.io 
import { Server } from 'socket.io';

// import routes
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';
import favouriteRoutes from './routes/favourite.js';

// import models
import User from './models/user.js';

// import error handler
import errorHandler from './Middleware/errorHandler.js';

import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const server = createServer(app);

app.set("trust proxy", 1);

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

// SESSION SETUP
// Session Setup
const store = MongoStore.create({
    mongoUrl: process.env.DB_URL,
    crypto: { secret: process.env.EXPRESS_SESSION_KEY },
    ttl: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE : ", err);
});

// session middleware
const sessionMiddleware = session({
    secret: process.env.EXPRESS_SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "none",
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

// socket.io setup
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
    }
});

io.on("connection", (socket) => {
    // console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
        // console.log("Client disconnected:", socket.id);
    });
});
// Attach io to the app instance
app.set('io', io);

// ROUTES
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/favourite', favouriteRoutes);

// error handler
app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`server live on port : ${PORT}`);
});
import express from 'express';
const router = express.Router();
import passport from 'passport';
import { auth } from '../Middleware/AuthMid.js';
import { validateUser } from '../Middleware/ValidationMid.js';
import { signUp, login, logout, protectedRoute } from '../controllers/user.js';

// signup
router.post('/SignUp', validateUser, signUp);

// Login 
router.post('/Login', passport.authenticate('local'), login);

// logOut
router.get('/Logout', auth, logout);

// protected
router.get('/protected', auth, protectedRoute);

export default router;
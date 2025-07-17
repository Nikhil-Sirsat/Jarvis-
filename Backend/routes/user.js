import express from 'express';
const router = express.Router();
import passport from 'passport';
import { auth } from '../Middleware/AuthMid.js';
import { validateUser } from '../Middleware/ValidationMid.js';
import { signUp, login, logout, protectedRoute, getMemory, deleteOneMemory, getReflection, setPersona } from '../controllers/user.js';
import { asyncHandler } from '../Middleware/asyncHandler.js';

// signup
router.post('/SignUp', validateUser, asyncHandler(signUp));

// Login 
router.post('/Login', passport.authenticate('local'), login);

// set persona
router.post('/setPersona', auth, asyncHandler(setPersona));

// logOut
router.get('/Logout', auth, logout);

// protected
router.get('/protected', auth, protectedRoute);

// Get Memory
router.get('/memory', auth, asyncHandler(getMemory));

// Get reflection
router.get('/reflection/:userId', auth, asyncHandler(getReflection));

// Delete Memory
router.delete('/memory/:id', auth, asyncHandler(deleteOneMemory));


export default router;
import express from 'express';
const router = express.Router();
import { auth } from '../Middleware/AuthMid.js';
import { asyncHandler } from '../Middleware/asyncHandler.js';
import Favourite from '../models/favourite.js';
import ChatMessage from '../models/ChatMessage.js';
import ExpressError from '../Utils/ExpressError.js';

router.post('/:msgId', auth, asyncHandler(async (req, res) => {
    const { msgId } = req.params;

    if (!msgId) {
        throw new ExpressError(res.status(400).json({ message: 'Message ID is required' }));
    }

    // Check points
    const message = await ChatMessage.findById(msgId);
    if (!message) {
        throw new ExpressError(res.status(404).json({ message: 'Message not found' }));
    }

    if (message.sender !== 'ai') {
        throw new ExpressError(res.status(400).json({ message: 'Only AI messages can be favourited' }));
    }

    // Check if the message is already favourited by the user
    const existingFavourite = await Favourite.findOne({ msgId, userId: req.user._id });
    if (existingFavourite) {
        throw new ExpressError(res.status(400).json({ message: 'Message is already favourited' }));
    }

    const favourite = new Favourite({
        msgId,
        userId: req.user._id
    });

    await favourite.save();

    res.status(201).json(favourite);
}));

export default router;
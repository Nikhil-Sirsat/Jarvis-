
import Favourite from '../models/favourite.js';
import ChatMessage from '../models/chatMessage.js';
import ExpressError from '../Utils/ExpressError.js';

export const addFavourite = async (req, res) => {
    const { msgId } = req.params;

    if (!msgId) {
        throw new ExpressError(400, 'Message ID is required');
    }

    // Check points
    const message = await ChatMessage.findById(msgId).populate('conversationId');
    if (!message) {
        throw new ExpressError(404, 'Message not found');
    }

    if (!message.conversationId.userId.equals(req.user._id)) {
        throw new ExpressError(403, 'You can only favourite your own messages');
    }

    if (message.sender !== 'ai') {
        throw new ExpressError(400, 'Only AI messages can be favourited');
    }

    // Check if the message is already favourited by the user
    const existingFavourite = await Favourite.findOne({ msgId, userId: req.user._id });
    if (existingFavourite) {
        throw new ExpressError(400, 'Message is already favourited');
    }

    const favourite = new Favourite({
        msgId,
        userId: req.user._id
    });

    await favourite.save();

    res.status(201).json({ message: 'message added to favourites' });
};

export const getFavourites = async (req, res) => {
    const favourites = await Favourite.find({ userId: req.user._id })
        .populate('msgId');

    // Filter favourites with missing msgId (deleted message)
    const filtered = favourites.map(fav => {
        if (!fav.msgId) {
            // Message was deleted, return null for msgId
            return { ...fav.toObject(), msgId: null };
        }
        return fav;
    });

    res.status(200).json(filtered);
};

export const isFavourite = async (req, res) => {

    const { msgId } = req.params;

    if (!msgId) {
        throw new ExpressError(400, 'Message ID is required');
    }

    // Check if the message is favourited by the user
    const existingFavourite = await Favourite.findOne({ msgId, userId: req.user._id });

    if (existingFavourite) {
        res.status(200).json({ isFavourite: true });
    } else {
        res.status(200).json({ isFavourite: false });
    }
};

export const removeFavourite = async (req, res) => {
    const { msgId } = req.params;

    if (!msgId) {
        throw new ExpressError(400, 'Message ID is required');
    }

    // Check if the message is favourited by the user
    const existingFavourite = await Favourite.findOne({ msgId, userId: req.user._id });
    if (!existingFavourite) {
        throw new ExpressError(404, 'Favourite not found');
    }

    await Favourite.deleteOne({ _id: existingFavourite._id });

    res.status(204).json({ message: 'message successfully removed from favourites' });
};
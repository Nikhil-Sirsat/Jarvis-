
import Favourite from '../models/favourite.js';
import ChatMessage from '../models/ChatMessage.js';
import ExpressError from '../Utils/ExpressError.js';

export const addFavourite = async (req, res) => {
    const { msgId } = req.params;

    if (!msgId) {
        throw new ExpressError(400, 'Message ID is required');
    }

    // Check points
    const message = await ChatMessage.findById(msgId);
    if (!message) {
        throw new ExpressError(404, 'Message not found');
    }

    if (message.userId.toString() !== req.user._id.toString()) {
        throw new ExpressError(403, 'You can only favourite your own messages');
    }

    if (message.sender !== 'ai') {
        throw new ExpressError(400, 'Only AI messages can be favourited');
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
}

export const getFavourites = async (req, res) => {
    const favourites = await Favourite.find({ userId: req.user._id })
        .populate('msgId'); // This will populate the ChatMessage details

    res.status(200).json(favourites);
}

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
}

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

    res.status(204).send();
}
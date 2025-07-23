import Conversation from '../models/conversation.js';
import ExpressError from '../Utils/ExpressError.js';

//authentication
export const auth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: 'Not authenticated' });
};

// is owner of the conversation
export const isAuther = async (req, res, next) => {

    try {

        const { conversationId } = req.params;
        const conversation = await Conversation.findById(conversationId);

        if (!conversation.userId.equals(req.user._id)) {
            throw new ExpressError(403, 'You are not the owner of this conversation');
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
import Conversation from '../models/Conversation.js';

//authentication
export const auth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: 'Not authenticated' });
};

// is owner of the conversation
export const isAuther = async (req, res, next) => {

    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation.userId.equals(req.user._id)) {
        return res.status(401).json({ message: 'You are not the author of this conversation' });
    }

    next();
};
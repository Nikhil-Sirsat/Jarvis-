import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        default: 'New Chat',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// indexes
conversationSchema.index({ userId: 1, createdAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;

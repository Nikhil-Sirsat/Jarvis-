import mongoose from "mongoose";
const Schema = mongoose.Schema;

const chatMessageSchema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    sender: {
        type: String, // 'user' or 'ai'
        enum: ['user', 'ai'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// indexing
chatMessageSchema.index({ conversationId: 1, timestamp: -1, sender: 1 });


const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;

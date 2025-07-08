import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const FavouriteSchema = new Schema({
    msgId: {
        type: Schema.Types.ObjectId,
        ref: 'ChatMessage',
        required: true
    },

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// indexing
FavouriteSchema.index({ userId: 1, msgId: 1 }, { unique: true });
FavouriteSchema.index({ userId: 1, timestamp: -1 });

const Favourites = mongoose.model("Favourite", FavouriteSchema);
export default Favourites;
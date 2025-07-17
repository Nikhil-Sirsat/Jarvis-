import mongoose from "mongoose";
const Schema = mongoose.Schema;
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true, },
    persona: {
        nickname: { type: String, default: "" },
        userRole: { type: String, default: "" },
        traits: [{ type: String }], // Array of string traits
        extraNotes: { type: String, default: "" }
    }
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

const User = mongoose.model("User", userSchema);
export default User;
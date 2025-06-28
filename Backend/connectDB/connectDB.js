import dotenv from 'dotenv';
dotenv.config();
import ExpressError from '../Utils/ExpressError.js';

import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connect(process.env.DB_URL).then(() => {
        console.log("Connected to Database");
    }).catch((err) => {
        throw new ExpressError(500, `Database connection failed: ${err.message || err}`);
    });
};

export default connectDB;
import dotenv from 'dotenv';
dotenv.config();
import ExpressError from '../Utils/ExpressError.js';

import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connect(process.env.DB_URL).then(() => {
        console.log("Connected to Database");
    }).catch((err) => {
        console.log('Database connection failed : ', err);
        throw new ExpressError(500, `Database connection failed: ${err.message}`);
    });
};

export default connectDB;
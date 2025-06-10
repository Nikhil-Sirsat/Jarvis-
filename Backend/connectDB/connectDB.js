import dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connect(process.env.DB_URL).then(() => {
        console.log("Connected to Database");
    }).catch((err) => {
        console.log(`Database connection error: ${err}`);
    });
};

export default connectDB;
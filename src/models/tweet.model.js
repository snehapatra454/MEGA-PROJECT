import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const tweetSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true}) // Automatically add createdAt and updatedAt

export const Tweet = mongoose.model("Tweet", tweetSchema);
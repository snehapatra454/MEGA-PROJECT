/**
 * Like Model - Manages like/unlike functionality
 * Represents likes on videos, comments, and tweets
 * 
 * Required packages:
 * - mongoose: MongoDB object modeling for Node.js
 * 
 * Schema Purpose:
 * - Tracks which users like which content (videos, comments, tweets)
 * - Enables like/unlike functionality
 * - Supports like counts and user like status
 */

import mongoose, {Schema} from "mongoose"; // npm install mongoose

// Define like schema for content interactions
const likeSchema = new Schema({
    // Reference to liked video (optional - only one of video/comment/tweet should be present)
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    
    // Reference to liked comment (optional)
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    
    // Reference to liked tweet (optional)
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    
    // User who liked the content (required)
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
})

// Create compound indexes for efficient queries and prevent duplicate likes
likeSchema.index({ video: 1, likedBy: 1 }, { unique: true, sparse: true })
likeSchema.index({ comment: 1, likedBy: 1 }, { unique: true, sparse: true })
likeSchema.index({ tweet: 1, likedBy: 1 }, { unique: true, sparse: true })

// Export Like model for use in controllers and services
export const Like = mongoose.model("Like", likeSchema)
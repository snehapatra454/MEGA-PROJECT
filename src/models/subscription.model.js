/**
 * Subscription Model - Manages user subscription relationships
 * Represents the many-to-many relationship between users (subscribers and channels)
 * 
 * Required packages:
 * - mongoose: MongoDB object modeling for Node.js
 * 
 * Schema Purpose:
 * - Tracks which users subscribe to which channels
 * - Enables features like subscriber count, subscription lists
 * - Supports follow/unfollow functionality
 */

import mongoose, {Schema} from "mongoose" // npm install mongoose

// Define subscription schema for user-channel relationships
const subscriptionSchema = new Schema({
    // User who is subscribing (follower)
    subscriber: {
        type: Schema.Types.ObjectId, // Reference to User document
        ref: "User", // References User model
        required: true // Subscriber is mandatory
    },
    
    // User being subscribed to (channel owner/content creator)
    channel: {
        type: Schema.Types.ObjectId, // Reference to User document  
        ref: "User", // References User model
        required: true // Channel is mandatory
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
})

// Create compound index for efficient queries and prevent duplicate subscriptions
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true })

// Export Subscription model for use in controllers and services
export const Subscription = mongoose.model("Subscription", subscriptionSchema)
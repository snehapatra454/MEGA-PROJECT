/**
 * Playlist Model - Manages video playlists
 * Represents collections of videos organized by users
 * 
 * Required packages:
 * - mongoose: MongoDB object modeling for Node.js
 * 
 * Schema Purpose:
 * - Allows users to create and manage video playlists
 * - Organizes videos into collections
 * - Supports playlist sharing and management
 */

import mongoose, {Schema} from 'mongoose'; // npm install mongoose

// Define playlist schema for video collections
const playlistSchema = new Schema({
    // Playlist name (required)
    name: {
        type: String,
        required: true,
        trim: true
    },
    
    // Playlist description (optional)
    description: {
        type: String,
        required: false,
        trim: true,
        default: ""
    },
    
    // Array of video references in the playlist
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    
    // User who owns the playlist (required)
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
})

// Create indexes for efficient queries
playlistSchema.index({ owner: 1 }) // Index for finding user playlists
playlistSchema.index({ name: 1, owner: 1 }) // Compound index for playlist names by user

// Export Playlist model for use in controllers and services
export const Playlist = mongoose.model("Playlist", playlistSchema);
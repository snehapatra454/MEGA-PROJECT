/**
 * Playlist controller functions
 * Handles playlist-related HTTP requests and business logic
 * 
 * Required packages:
 * - mongoose: MongoDB object modeling for Node.js
 */

import mongoose, {isValidObjectId} from "mongoose" // npm install mongoose
import {Playlist} from "../models/playlist.model.js" // Playlist model
import {Video} from "../models/video.model.js" // Video model
import {User} from "../models/user.model.js" // User model
import {ApiError} from "../utils/ApiError.js" // Custom API error class
import {ApiResponse} from "../utils/ApiResponse.js" // Custom API response utility
import {asyncHandler} from "../utils/asyncHandler.js" // Custom async error handler

/**
 * Create a new playlist
 * @route POST /api/v1/playlist
 * @access Private (requires authentication)
 */
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    
    // Validate required fields
    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required")
    }
    
    // Create playlist
    const playlist = await Playlist.create({
        name: name.trim(),
        description: description?.trim() || "",
        owner: req.user._id
    })
    
    return res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    )
})

/**
 * Get all playlists of a user
 * @route GET /api/v1/playlist/user/:userId
 * @access Public
 */
const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    // Validate user ID
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }
    
    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    
    // Get user playlists with video count
    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $addFields: {
                videoCount: { $size: "$videos" }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ])
    
    return res.status(200).json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
    )
})

/**
 * Get playlist by ID with all videos
 * @route GET /api/v1/playlist/:playlistId
 * @access Public
 */
const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    // Validate playlist ID
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    
    // Get playlist with videos and owner details
    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                videoCount: { $size: "$videos" }
            }
        }
    ])
    
    if (!playlist?.length) {
        throw new ApiError(404, "Playlist not found")
    }
    
    return res.status(200).json(
        new ApiResponse(200, playlist[0], "Playlist fetched successfully")
    )
})

/**
 * Add video to playlist
 * @route PATCH /api/v1/playlist/add/:videoId/:playlistId
 * @access Private (requires authentication)
 */
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    // Validate IDs
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID")
    }
    
    // Check if playlist exists and user owns it
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only modify your own playlists")
    }
    
    // Check if video exists
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    
    // Check if video is already in playlist
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in playlist")
    }
    
    // Add video to playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $push: { videos: videoId } },
        { new: true }
    )
    
    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully")
    )
})

/**
 * Remove video from playlist
 * @route PATCH /api/v1/playlist/remove/:videoId/:playlistId
 * @access Private (requires authentication)
 */
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    // Validate IDs
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID")
    }
    
    // Check if playlist exists and user owns it
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only modify your own playlists")
    }
    
    // Check if video is in playlist
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video not found in playlist")
    }
    
    // Remove video from playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true }
    )
    
    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully")
    )
})

/**
 * Delete a playlist
 * @route DELETE /api/v1/playlist/:playlistId
 * @access Private (requires authentication)
 */
const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    // Validate playlist ID
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    
    // Check if playlist exists and user owns it
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own playlists")
    }
    
    // Delete playlist
    await Playlist.findByIdAndDelete(playlistId)
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    )
})

/**
 * Update playlist details
 * @route PATCH /api/v1/playlist/:playlistId
 * @access Private (requires authentication)
 */
const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    // Validate playlist ID
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }
    
    // Validate at least one field to update
    if (!name && !description) {
        throw new ApiError(400, "At least one field is required to update")
    }
    
    // Check if playlist exists and user owns it
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own playlists")
    }
    
    // Build update object
    const updateFields = {}
    if (name) updateFields.name = name.trim()
    if (description !== undefined) updateFields.description = description.trim()
    
    // Update playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $set: updateFields },
        { new: true }
    )
    
    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
/**
 * Like controller functions
 * Handles like/unlike functionality for videos, comments, and tweets
 * 
 * Required packages:
 * - mongoose: MongoDB object modeling for Node.js
 */

import mongoose, {isValidObjectId} from "mongoose" // npm install mongoose
import {Like} from "../models/like.model.js" // Like model
import {ApiError} from "../utils/ApiError.js" // Custom API error class
import {ApiResponse} from "../utils/ApiResponse.js" // Custom API response utility
import {asyncHandler} from "../utils/asyncHandler.js" // Custom async error handler

/**
 * Toggle like on video (like/unlike)
 * @route POST /api/v1/likes/toggle/v/:videoId
 * @access Private (requires authentication)
 */
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    
    // Validate video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    
    // Check if user already liked this video
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })
    
    if (existingLike) {
        // Unlike: Remove the like
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(
            new ApiResponse(200, { isLiked: false }, "Video unliked successfully")
        )
    } else {
        // Like: Create new like
        await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
        return res.status(200).json(
            new ApiResponse(200, { isLiked: true }, "Video liked successfully")
        )
    }
})

/**
 * Toggle like on comment (like/unlike)
 * @route POST /api/v1/likes/toggle/c/:commentId
 * @access Private (requires authentication)
 */
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    
    // Validate comment ID
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    
    // Check if user already liked this comment
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })
    
    if (existingLike) {
        // Unlike: Remove the like
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(
            new ApiResponse(200, { isLiked: false }, "Comment unliked successfully")
        )
    } else {
        // Like: Create new like
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
        return res.status(200).json(
            new ApiResponse(200, { isLiked: true }, "Comment liked successfully")
        )
    }
})

/**
 * Toggle like on tweet (like/unlike)
 * @route POST /api/v1/likes/toggle/t/:tweetId
 * @access Private (requires authentication)
 */
const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    
    // Validate tweet ID
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }
    
    // Check if user already liked this tweet
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })
    
    if (existingLike) {
        // Unlike: Remove the like
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(
            new ApiResponse(200, { isLiked: false }, "Tweet unliked successfully")
        )
    } else {
        // Like: Create new like
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
        return res.status(200).json(
            new ApiResponse(200, { isLiked: true }, "Tweet liked successfully")
        )
    }
})

/**
 * Get all videos liked by the current user
 * @route GET /api/v1/likes/videos
 * @access Private (requires authentication)
 */
const getLikedVideos = asyncHandler(async (req, res) => {
    // Get all video likes by current user with video details
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
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
            $addFields: {
                videoDetails: { $first: "$videoDetails" }
            }
        },
        {
            $project: {
                videoDetails: 1,
                createdAt: 1
            }
        }
    ])
    
    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
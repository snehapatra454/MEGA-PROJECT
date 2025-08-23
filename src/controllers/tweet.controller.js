/**
 * Tweet controller functions
 * Handles tweet-related HTTP requests and business logic
 * 
 * Required packages:
 * - mongoose: MongoDB object modeling for Node.js
 */

import mongoose, { isValidObjectId } from "mongoose" // npm install mongoose
import {Tweet} from "../models/tweet.model.js" // Tweet model
import {User} from "../models/user.model.js" // User model
import {ApiError} from "../utils/ApiError.js" // Custom API error class
import {ApiResponse} from "../utils/ApiResponse.js" // Custom API response utility
import {asyncHandler} from "../utils/asyncHandler.js" // Custom async error handler

/**
 * Create a new tweet
 * @route POST /api/v1/tweets
 * @access Private (requires authentication)
 */
const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    
    // Validate tweet content
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required")
    }
    
    if (content.trim().length > 280) {
        throw new ApiError(400, "Tweet content cannot exceed 280 characters")
    }
    
    // Create tweet
    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id
    })
    
    // Get tweet with owner details
    const createdTweet = await Tweet.aggregate([
        {
            $match: { _id: tweet._id }
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
                owner: { $first: "$owner" }
            }
        }
    ])
    
    return res.status(201).json(
        new ApiResponse(201, createdTweet[0], "Tweet created successfully")
    )
})

/**
 * Get all tweets from a specific user
 * @route GET /api/v1/tweets/user/:userId
 * @access Public
 */
const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params
    const {page = 1, limit = 10} = req.query
    
    // Validate user ID
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }
    
    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    
    // Get user tweets with pagination
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
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
                owner: { $first: "$owner" }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: parseInt(limit)
        }
    ])
    
    return res.status(200).json(
        new ApiResponse(200, tweets, "User tweets fetched successfully")
    )
})

/**
 * Update a tweet
 * @route PATCH /api/v1/tweets/:tweetId
 * @access Private (requires authentication)
 */
const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const {content} = req.body
    
    // Validate tweet ID
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }
    
    // Validate tweet content
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required")
    }
    
    if (content.trim().length > 280) {
        throw new ApiError(400, "Tweet content cannot exceed 280 characters")
    }
    
    // Find tweet
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    
    // Check if user owns the tweet
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own tweets")
    }
    
    // Update tweet
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $set: { content: content.trim() } },
        { new: true }
    )
    
    return res.status(200).json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    )
})

/**
 * Delete a tweet
 * @route DELETE /api/v1/tweets/:tweetId
 * @access Private (requires authentication)
 */
const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    
    // Validate tweet ID
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }
    
    // Find tweet
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    
    // Check if user owns the tweet
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own tweets")
    }
    
    // Delete tweet
    await Tweet.findByIdAndDelete(tweetId)
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
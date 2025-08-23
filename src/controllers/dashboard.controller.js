/**
 * Dashboard controller functions
 * Handles dashboard-related HTTP requests and analytics
 * 
 * Required packages:
 * - mongoose: MongoDB object modeling for Node.js
 */

import mongoose from "mongoose" // npm install mongoose
import {Video} from "../models/video.model.js" // Video model
import {Subscription} from "../models/subscription.model.js" // Subscription model
import {Like} from "../models/like.model.js" // Like model
import {ApiError} from "../utils/ApiError.js" // Custom API error class
import {ApiResponse} from "../utils/ApiResponse.js" // Custom API response utility
import {asyncHandler} from "../utils/asyncHandler.js" // Custom async error handler

/**
 * Get channel statistics and analytics
 * @route GET /api/v1/dashboard/stats
 * @access Private (requires authentication)
 */
const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user._id
    
    // Get comprehensive channel statistics using aggregation
    const stats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$likes" } },
                totalSubscribers: { $first: { $size: "$subscribers" } }
            }
        },
        {
            $project: {
                _id: 0,
                totalVideos: 1,
                totalViews: 1,
                totalLikes: 1,
                totalSubscribers: 1
            }
        }
    ])
    
    // If no videos, get subscriber count separately
    if (!stats.length) {
        const subscriberCount = await Subscription.countDocuments({
            channel: channelId
        })
        
        return res.status(200).json(
            new ApiResponse(200, {
                totalVideos: 0,
                totalViews: 0,
                totalLikes: 0,
                totalSubscribers: subscriberCount
            }, "Channel stats fetched successfully")
        )
    }
    
    return res.status(200).json(
        new ApiResponse(200, stats[0], "Channel stats fetched successfully")
    )
})

/**
 * Get all videos uploaded by the channel
 * @route GET /api/v1/dashboard/videos
 * @access Private (requires authentication)
 */
const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query
    
    // Build sort object
    const sortConditions = {}
    sortConditions[sortBy] = sortType === "desc" ? -1 : 1
    
    // Get channel videos with statistics
    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },
        {
            $sort: sortConditions
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: parseInt(limit)
        },
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                videoFile: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                likesCount: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ])
    
    return res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }
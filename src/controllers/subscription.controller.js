/**
 * Subscription controller functions
 * Handles subscription-related HTTP requests and business logic
 * 
 * Required packages:
 * - mongoose: MongoDB object modeling for Node.js
 */

import mongoose, {isValidObjectId} from "mongoose" // npm install mongoose
import {User} from "../models/user.model.js" // User model
import { Subscription } from "../models/subscription.model.js" // Subscription model
import {ApiError} from "../utils/ApiError.js" // Custom API error class
import {ApiResponse} from "../utils/ApiResponse.js" // Custom API response utility
import {asyncHandler} from "../utils/asyncHandler.js" // Custom async error handler

/**
 * Toggle subscription to a channel (subscribe/unsubscribe)
 * @route POST /api/v1/subscriptions/c/:channelId
 * @access Private (requires authentication)
 */
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    // Validate channel ID
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    
    // Check if channel exists
    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }
    
    // Prevent self-subscription
    if (channelId === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel")
    }
    
    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })
    
    if (existingSubscription) {
        // Unsubscribe: Remove subscription
        await Subscription.findByIdAndDelete(existingSubscription._id)
        return res.status(200).json(
            new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
        )
    } else {
        // Subscribe: Create new subscription
        await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })
        return res.status(200).json(
            new ApiResponse(200, { subscribed: true }, "Subscribed successfully")
        )
    }
})

/**
 * Get subscriber list of a channel
 * @route GET /api/v1/subscriptions/u/:channelId
 * @access Private (requires authentication)
 */
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    // Validate channel ID
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    
    // Get all subscribers of the channel with user details
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
                subscriber: { $first: "$subscriber" }
            }
        },
        {
            $project: {
                subscriber: 1,
                createdAt: 1
            }
        }
    ])
    
    return res.status(200).json(
        new ApiResponse(200, subscribers, "Channel subscribers fetched successfully")
    )
})

/**
 * Get channels list to which user has subscribed
 * @route GET /api/v1/subscriptions/c/:subscriberId
 * @access Private (requires authentication)
 */
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    // Validate subscriber ID
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }
    
    // Get all channels subscribed by the user with channel details
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1,
                            coverImage: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                channel: { $first: "$channel" }
            }
        },
        {
            $project: {
                channel: 1,
                createdAt: 1
            }
        }
    ])
    
    return res.status(200).json(
        new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
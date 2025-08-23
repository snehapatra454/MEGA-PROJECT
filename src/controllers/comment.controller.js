/**
 * Comment controller functions
 * Handles comment-related HTTP requests and business logic
 * 
 * Required packages:
 * - mongoose: MongoDB object modeling for Node.js
 */

import mongoose, {isValidObjectId} from "mongoose" // npm install mongoose
import {Comment} from "../models/comment.model.js" // Comment model
import {Video} from "../models/video.model.js" // Video model
import {ApiError} from "../utils/ApiError.js" // Custom API error class
import {ApiResponse} from "../utils/ApiResponse.js" // Custom API response utility
import {asyncHandler} from "../utils/asyncHandler.js" // Custom async error handler

/**
 * Get all comments for a video with pagination
 * @route GET /api/v1/comments/:videoId
 * @access Public
 */
const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
    // Validate video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    
    // Check if video exists
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    
    // Get comments with user details and pagination
    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
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
        new ApiResponse(200, comments, "Comments fetched successfully")
    )
})

/**
 * Add a comment to a video
 * @route POST /api/v1/comments/:videoId
 * @access Private (requires authentication)
 */
const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body
    
    // Validate video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    
    // Validate comment content
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required")
    }
    
    // Check if video exists
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    
    // Create comment
    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id
    })
    
    // Get comment with owner details
    const createdComment = await Comment.aggregate([
        {
            $match: { _id: comment._id }
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
        new ApiResponse(201, createdComment[0], "Comment added successfully")
    )
})

/**
 * Update a comment
 * @route PATCH /api/v1/comments/c/:commentId
 * @access Private (requires authentication)
 */
const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {content} = req.body
    
    // Validate comment ID
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    
    // Validate comment content
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required")
    }
    
    // Find comment
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    
    // Check if user owns the comment
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own comments")
    }
    
    // Update comment
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { content: content.trim() } },
        { new: true }
    )
    
    return res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    )
})

/**
 * Delete a comment
 * @route DELETE /api/v1/comments/c/:commentId
 * @access Private (requires authentication)
 */
const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    
    // Validate comment ID
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    
    // Find comment
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    
    // Check if user owns the comment
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own comments")
    }
    
    // Delete comment
    await Comment.findByIdAndDelete(commentId)
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
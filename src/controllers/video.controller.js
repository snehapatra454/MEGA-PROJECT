/**
 * Video controller functions
 * Handles video-related HTTP requests and business logic
 * 
 * Required packages:
 * - mongoose: MongoDB object modeling for Node.js
 */

import mongoose, {isValidObjectId} from "mongoose" // npm install mongoose
import {Video} from "../models/video.model.js" // Video model
import {User} from "../models/user.model.js" // User model
import {ApiError} from "../utils/ApiError.js" // Custom API error class
import {ApiResponse} from "../utils/ApiResponse.js" // Custom API response utility
import {asyncHandler} from "../utils/asyncHandler.js" // Custom async error handler
import {uploadOnCloudinary} from "../utils/cloudinary.js" // Cloudinary utility for file uploads

/**
 * Get all videos with pagination, search, and filtering
 * @route GET /api/v1/videos
 * @access Private (requires authentication)
 */
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    
    // Build match conditions for aggregation pipeline
    const matchConditions = { isPublished: true }
    
    if (userId && isValidObjectId(userId)) {
        matchConditions.owner = new mongoose.Types.ObjectId(userId)
    }
    
    if (query) {
        matchConditions.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }
    
    // Build sort conditions
    const sortConditions = {}
    if (sortBy && sortType) {
        sortConditions[sortBy] = sortType === "desc" ? -1 : 1
    } else {
        sortConditions.createdAt = -1 // Default sort by newest
    }
    
    const videos = await Video.aggregate([
        { $match: matchConditions },
        { $sort: sortConditions },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { fullname: 1, username: 1, avatar: 1 } }
                ]
            }
        },
        { $addFields: { owner: { $first: "$owner" } } }
    ])
    
    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    )
})

/**
 * Upload and publish a new video
 * @route POST /api/v1/videos
 * @access Private (requires authentication)
 */
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    
    // Validate required fields
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }
    
    // Get file paths from multer
    const videoFileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    
    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required")
    }
    
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }
    
    // Upload files to Cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    
    if (!videoFile) {
        throw new ApiError(400, "Error uploading video file")
    }
    
    if (!thumbnail) {
        throw new ApiError(400, "Error uploading thumbnail")
    }
    
    // Create video document
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user._id
    })
    
    const createdVideo = await Video.findById(video._id)
    
    if (!createdVideo) {
        throw new ApiError(500, "Something went wrong while uploading video")
    }
    
    return res.status(201).json(
        new ApiResponse(201, createdVideo, "Video uploaded successfully")
    )
})

/**
 * Get video by ID with owner details
 * @route GET /api/v1/videos/:videoId
 * @access Private (requires authentication)
 */
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    
    const video = await Video.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { fullname: 1, username: 1, avatar: 1 } }
                ]
            }
        },
        { $addFields: { owner: { $first: "$owner" } } }
    ])
    
    if (!video?.length) {
        throw new ApiError(404, "Video not found")
    }
    
    return res.status(200).json(
        new ApiResponse(200, video[0], "Video fetched successfully")
    )
})

/**
 * Update video details like title, description, thumbnail
 * @route PATCH /api/v1/videos/:videoId
 * @access Private (requires authentication)
 */
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    
    if (!title && !description) {
        throw new ApiError(400, "At least one field is required to update")
    }
    
    const video = await Video.findById(videoId)
    
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    
    // Check if user owns the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own videos")
    }
    
    const updateFields = {}
    if (title) updateFields.title = title
    if (description) updateFields.description = description
    
    // Handle thumbnail update if provided
    if (req.file) {
        const thumbnail = await uploadOnCloudinary(req.file.path)
        if (thumbnail) {
            updateFields.thumbnail = thumbnail.url
        }
    }
    
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateFields },
        { new: true }
    )
    
    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    )
})

/**
 * Delete video
 * @route DELETE /api/v1/videos/:videoId
 * @access Private (requires authentication)
 */
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    
    const video = await Video.findById(videoId)
    
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    
    // Check if user owns the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own videos")
    }
    
    await Video.findByIdAndDelete(videoId)
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )
})

/**
 * Toggle video publish status
 * @route PATCH /api/v1/videos/toggle/publish/:videoId
 * @access Private (requires authentication)
 */
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    
    const video = await Video.findById(videoId)
    
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    
    // Check if user owns the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only modify your own videos")
    }
    
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: { isPublished: !video.isPublished } },
        { new: true }
    )
    
    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video publish status updated successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
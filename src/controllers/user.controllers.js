/**
 * User controller functions
 * Handles user-related HTTP requests and business logic
 * 
 * Required packages:
 * - express: Web framework for Node.js (req, res objects)
 */

import { asyncHandler } from "../utils/asyncHandler.js" // Custom async error handler
import { ApiError } from "../utils/ApiError.js" // Custom API error class
import { User } from "../models/user.model.js" // User model
import { uploadOnCloudinary } from "../utils/cloudinary.js" // Cloudinary utility for file uploads
import { ApiResponse } from "../utils/ApiResponse.js" // Custom API response utility
/**
 * Register a new user
 * @route POST /api/v1/users/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
    // TODO: Implement user registration logic
    /*res.status(200).json({
        message: "ok"
    })*/
   // get user details from front end
   // validation - not empty
   // check if user alerady exists: username,email
   // check for images, check for avatar
   // upload them to cloudinary, avatar
   // create user object - create entry in db
   // remove password and refresh token field from response
   // check for user creation
   // return response

   // Debug logs to see incoming data
   console.log("Request body:", req.body);
   console.log("Files:", req.files);
   
   // Extract user details from request body (form-data)
   const { fullName, email, username, password } = req.body || {}

    // Validate that all required fields are provided and not empty
    if (
        [fullName, email, username, password].some((field) => 
            field === undefined || field === null || field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // Check if user already exists with same username or email
    const existedUser = await User.findOne({
        $or: [{ username },{ email }] // MongoDB $or operator for multiple conditions
    })

    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    // Extract file paths from multer processed files
    // Avatar is required, coverImage is optional
    const avatarLocalPath = req.files?.avatar[0]?.path;
    
    // Handle optional cover image with safe checking
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // Validate that avatar file is provided (required field)
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    // Upload files to Cloudinary cloud storage
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath) // Will be null if no file

    // Ensure avatar upload was successful
    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    // Create new user in database
    const user = await User.create({
        fullname: fullName, // Map camelCase to lowercase for schema
        avatar: avatar.url, // Cloudinary URL
        coverImage: coverImage?.url || "", // Optional field, empty string if no image
        email,
        password, // Will be hashed by pre-save middleware
        username: username.toLowerCase() // Ensure lowercase for consistency
    })
    // Fetch created user without sensitive fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" // Exclude password and refresh token from response
    )

    // Verify user was created successfully
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    
    // Return success response with user data
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

export {registerUser}
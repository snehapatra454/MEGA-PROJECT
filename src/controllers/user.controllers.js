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
import * as jwt from 'jsonwebtoken'
/**
 * Register a new user
 * @route POST /api/v1/users/register
 * @access Public
 */

/**
 * Generates JWT access and refresh tokens for a user
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {Object} Object containing accessToken and refreshToken
 */
const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        // Find user by ID in database
        const user = await User.findById(userId)
        if (!user) {
            throw new Error("User not found")
        }
        
        console.log("Generating tokens for user:", user._id)
        
        // Generate JWT tokens using user model methods
        const accessToken = user.generateAccessToken() // Short-lived token for API access
        const refreshToken = user.generateRefreshToken() // Long-lived token for refreshing access

        // Save refresh token to database for validation during refresh
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false }) // Skip validation for performance

        return {accessToken, refreshToken}

    } catch (error) {
        console.log("Token generation error:", error)
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}


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


/**
 * Authenticate user and generate login session
 * @route POST /api/v1/users/login
 * @access Public
 */
const loginUser = asyncHandler(async (req,res) => {
    /**
     * Login Process:
     * 1. Extract credentials from request body
     * 2. Validate username/email and password are provided
     * 3. Find user in database by username or email
     * 4. Verify password using bcrypt comparison
     * 5. Generate JWT access and refresh tokens
     * 6. Set secure HTTP-only cookies
     * 7. Return user data and tokens
     */

    // Extract login credentials from request body
    const {email, username, password} = req.body
    
    // Validate that either username or email is provided
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Find user by username OR email using MongoDB $or operator
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    // Check if user exists in database
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    // Verify password using bcrypt comparison method from user model
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials")
    }

    // Generate JWT tokens for authenticated user
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    // Fetch user data without sensitive fields for response
    const LoggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // Cookie configuration for secure token storage
    const options = {
        httpOnly: true, // Prevent XSS attacks by making cookies inaccessible to JavaScript
        secure: req.protocol === 'https' // Dynamic: true for HTTPS, false for HTTP
    }
    
    // Send response with cookies and user data
    return res
    .status(200)
    .cookie("accessToken", accessToken, options) // Set access token cookie
    .cookie("refreshToken", refreshToken, options) // Set refresh token cookie
    .json(
        new ApiResponse(
            200, 
            {
                user: LoggedInUser, 
                accessToken, 
                refreshToken
            },
            "User logged in successfully"
        )
    )
})

/**
 * Logout user and invalidate session
 * @route POST /api/v1/users/logout
 * @access Private (requires authentication)
 */
const logoutUser = asyncHandler(async(req,res) => {
    /**
     * Logout Process:
     * 1. Remove refresh token from database (invalidate session)
     * 2. Clear HTTP-only cookies from browser
     * 3. Return success response
     * Note: req.user is available because of verifyJWT middleware
     */

    // Remove refresh token from database to invalidate user session
    await User.findByIdAndUpdate(
        req.user._id, // User ID from JWT middleware
        {
            $set: {
                refreshToken: undefined // Clear refresh token
            }
        },
        {
            new: true // Return updated document
        }
    )
    
    // Cookie configuration matching login settings
    const options = {
        httpOnly: true, // Prevent XSS attacks
        secure: req.protocol === 'https' // Dynamic: true for HTTPS, false for HTTP
    }

    // Clear cookies and send success response
    return res
    .status(200)
    .clearCookie("accessToken", options) // Remove access token cookie
    .clearCookie("refreshToken", options) // Remove refresh token cookie
    .json(new ApiResponse(200, {}, "User logged Out"))
})

/**
 * Refresh expired access token using valid refresh token
 * @route POST /api/v1/users/refresh-token
 * @access Public (but requires valid refresh token)
 */
const refreshAccessToken = asyncHandler(async(req, res) => {
    /**
     * Token Refresh Process:
     * 1. Extract refresh token from cookies or request body
     * 2. Verify refresh token is provided
     * 3. Decode and validate refresh token using JWT
     * 4. Find user associated with the token
     * 5. Compare incoming token with stored token in database
     * 6. Generate new access and refresh token pair
     * 7. Update cookies and return new tokens
     */

    // Extract refresh token from cookies (preferred) or request body (fallback)
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    // Validate that refresh token is provided
    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

    try {
        // Verify and decode the refresh token using JWT secret
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        // Find user associated with the decoded token
        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }

        // Security check: Compare incoming token with stored token in database
        // This prevents token reuse attacks
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }

        // Cookie configuration for new tokens
        const options = {
            httpOnly: true, // Prevent XSS attacks
            secure: req.protocol === 'https' // Dynamic: true for HTTPS, false for HTTP
        }

        // Generate new token pair (both access and refresh tokens)
        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

        // Send response with new tokens in cookies and response body
        return res
        .status(200)
        .cookie("accessToken", accessToken, options) // Set new access token cookie
        .cookie("refreshToken", newRefreshToken, options) // Set new refresh token cookie
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        // Handle JWT verification errors or other token-related issues
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "Current user fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "All fields are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
        ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})
export {registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage} // Export all functions for use in other parts of the application
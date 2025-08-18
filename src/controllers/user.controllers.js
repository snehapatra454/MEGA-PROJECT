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

   const { fullName, email, userName, password } = req.body
   console.log("email", email);

//    if(fullName === ""){
//     throw new ApiError(400, "Full name is required")
//    }
    if (
        [fullName, email, userName, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "Full name is required")
    }

    const existedUser = User.findOne({
        $or: [{ username: userName },{ email }]
    })

    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    //req.body access has alerady given by the express but multer provides req.files 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: userName.toLowerCase()
    })
    const createdUser = User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    ))
})

export {registerUser}
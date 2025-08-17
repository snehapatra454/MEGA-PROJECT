/**
 * User model schema for the video streaming application
 * Defines user structure with authentication and profile management
 * 
 * Required packages:
 * - mongoose: MongoDB object modeling for Node.js
 * - jsonwebtoken: JSON Web Token implementation
 * - bcrypt: Password hashing library
 */

import mongoose, {Schema} from "mongoose" // npm install mongoose
import jwt from "jsonwebtoken" // npm install jsonwebtoken
import bcrypt from "bcrypt" // npm install bcrypt

// Define user schema with validation and indexing
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true // Indexed for faster queries
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true // Indexed for search functionality
        },
        avatar: {
            type: String, // Cloudinary URL for user profile picture
            required: true
        },
        coverImage: {
            type: String // Cloudinary URL for user cover image
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video" // Reference to Video model
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String // JWT refresh token for authentication
        }
        
    }, {timestamps: true} // Automatically add createdAt and updatedAt
)

// Pre-save middleware to hash password before saving
userSchema.pre("save", async function (next) {
    // Only hash password if it has been modified
    if(!this.isModified("password")) return next();
    
    // Hash password with salt rounds of 10
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// Method to verify password during login
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// Method to generate JWT access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username, // Fixed typo: was 'useranme'
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// Method to generate JWT refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)
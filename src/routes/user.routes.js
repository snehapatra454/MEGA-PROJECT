/**
 * User routes configuration
 * Defines API endpoints for user-related operations
 * 
 * Required packages:
 * - express: Web framework for Node.js (Router functionality)
 */

import {Router} from "express" // npm install express
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controllers.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth..middleware.js"

// Create Express router instance
const router = Router()

// PUBLIC ROUTES (No authentication required)

// User registration endpoint with file upload support
router.route("/register").post(
    // Multer middleware to handle file uploads (avatar and cover image)
    upload.fields([
        {name: "avatar", maxCount: 1}, // Required: User profile picture
        {name: "coverImage", maxCount: 1} // Optional: User cover image
    ]),
    registerUser // Controller function to handle registration logic
)

// User login endpoint
router.route("/login").post(loginUser) // Controller function to authenticate user

// Token refresh endpoint (public but requires refresh token)
router.route("/refresh-token").post(refreshAccessToken) // Generate new access token

// PROTECTED ROUTES (Authentication required)

// User logout endpoint - requires valid JWT token
router.route("/logout").post(
    verifyJWT, // Middleware to verify JWT token and authenticate user
    logoutUser // Controller function to handle logout logic
)

export default router
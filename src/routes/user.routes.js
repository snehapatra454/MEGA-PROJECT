/**
 * User routes configuration
 * Defines API endpoints for user-related operations
 * 
 * Required packages:
 * - express: Web framework for Node.js (Router functionality)
 */

import {Router} from "express" // npm install express
import { loginUser, 
         logoutUser,
         registerUser,
         refreshAccessToken,
         changeCurrentPassword,
         getCurrentUser,
         updateAccountDetails,
         updateUserAvatar,
         updateUserCoverImage,
         getUserChannelProfile,
         getWatchHistory
        } from "../controllers/user.controllers.js"
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

router.route("/change-password").post(
    verifyJWT, // Middleware to verify JWT token and authenticate user
    // Controller function to change user password (not shown in this snippet)
    changeCurrentPassword // Controller function to change user password
)

router.route("/current-user").get(
    verifyJWT, // Middleware to verify JWT token and authenticate user
    getCurrentUser // Controller function to fetch current user details
)

router.route("/update-account").patch(
    verifyJWT, // Middleware to verify JWT token and authenticate user
    updateAccountDetails // Controller function to update user account details
)

router.route("/avatar").patch(
    verifyJWT, // Middleware to verify JWT token and authenticate user
    upload.single("avatar"), // Multer middleware to handle single file upload (avatar)
    updateUserAvatar // Controller function to update user avatar
)

router.route("/cover-image").patch(
    verifyJWT, // Middleware to verify JWT token and authenticate user
    upload.single("coverImage"), // Multer middleware to handle single file upload (cover image)
    updateUserCoverImage // Controller function to update user cover image
)

router.route("/c/:username").get(
    verifyJWT, // Middleware to verify JWT token and authenticate user
    getUserChannelProfile // Controller function to fetch user channel profile
)

router.route("/history").get(
    verifyJWT, // Middleware to verify JWT token and authenticate user
    getWatchHistory // Controller function to fetch user watch history
)
export default router
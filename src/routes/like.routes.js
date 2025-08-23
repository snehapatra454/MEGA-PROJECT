/**
 * Like routes configuration
 * Defines API endpoints for like/unlike operations
 * 
 * Required packages:
 * - express: Web framework for Node.js (Router functionality)
 */

import { Router } from 'express'; // npm install express
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth..middleware.js" // Fixed import path

// Create Express router instance
const router = Router();

// Apply JWT verification middleware to all routes in this file
router.use(verifyJWT); // All like routes require authentication

// LIKE/UNLIKE ROUTES

// Toggle like on video
router.route("/toggle/v/:videoId").post(toggleVideoLike);

// Toggle like on comment
router.route("/toggle/c/:commentId").post(toggleCommentLike);

// Toggle like on tweet
router.route("/toggle/t/:tweetId").post(toggleTweetLike);

// Get user's liked videos
router.route("/videos").get(getLikedVideos);

export default router
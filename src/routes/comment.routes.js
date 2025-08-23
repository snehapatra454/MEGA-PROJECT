/**
 * Comment routes configuration
 * Defines API endpoints for comment-related operations
 * 
 * Required packages:
 * - express: Web framework for Node.js (Router functionality)
 */

import { Router } from 'express'; // npm install express
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth..middleware.js" // Fixed import path

// Create Express router instance
const router = Router();

// Apply JWT verification middleware to all routes in this file
router.use(verifyJWT); // All comment routes require authentication

// COMMENT ROUTES

// Video comment management
router.route("/:videoId")
    .get(getVideoComments) // Get all comments for a video
    .post(addComment); // Add comment to a video

// Individual comment management
router.route("/c/:commentId")
    .delete(deleteComment) // Delete a comment
    .patch(updateComment); // Update a comment

export default router
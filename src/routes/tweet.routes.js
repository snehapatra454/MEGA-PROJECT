/**
 * Tweet routes configuration
 * Defines API endpoints for tweet-related operations
 * 
 * Required packages:
 * - express: Web framework for Node.js (Router functionality)
 */

import { Router } from 'express'; // npm install express
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth..middleware.js" // Fixed import path

// Create Express router instance
const router = Router();

// Apply JWT verification middleware to all routes in this file
router.use(verifyJWT); // All tweet routes require authentication

// TWEET ROUTES

// Create new tweet
router.route("/").post(createTweet);

// Get tweets by user
router.route("/user/:userId").get(getUserTweets);

// Individual tweet management
router.route("/:tweetId")
    .patch(updateTweet) // Update tweet
    .delete(deleteTweet); // Delete tweet

export default router
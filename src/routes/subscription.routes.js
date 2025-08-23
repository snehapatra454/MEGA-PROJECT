/**
 * Subscription routes configuration
 * Defines API endpoints for subscription-related operations
 * 
 * Required packages:
 * - express: Web framework for Node.js (Router functionality)
 */

import { Router } from 'express'; // npm install express
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth..middleware.js" // Fixed import path

// Create Express router instance
const router = Router();

// Apply JWT verification middleware to all routes in this file
router.use(verifyJWT); // All subscription routes require authentication

// SUBSCRIPTION ROUTES

// Channel subscription management
router
    .route("/c/:channelId")
    .get(getSubscribedChannels) // Get channels subscribed by user
    .post(toggleSubscription); // Subscribe/unsubscribe to channel

// Get subscribers of a specific channel
router.route("/u/:subscriberId").get(getUserChannelSubscribers); // Get channel's subscribers

export default router
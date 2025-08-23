/**
 * Dashboard routes configuration
 * Defines API endpoints for dashboard and analytics
 * 
 * Required packages:
 * - express: Web framework for Node.js (Router functionality)
 */

import { Router } from 'express'; // npm install express
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js"
import {verifyJWT} from "../middlewares/auth..middleware.js" // Fixed import path

// Create Express router instance
const router = Router();

// Apply JWT verification middleware to all routes in this file
router.use(verifyJWT); // All dashboard routes require authentication

// DASHBOARD ROUTES

// Get channel statistics and analytics
router.route("/stats").get(getChannelStats);

// Get channel videos with statistics
router.route("/videos").get(getChannelVideos);

export default router
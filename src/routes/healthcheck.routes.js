/**
 * Healthcheck routes configuration
 * Defines API endpoints for application health monitoring
 * 
 * Required packages:
 * - express: Web framework for Node.js (Router functionality)
 */

import { Router } from 'express'; // npm install express
import { healthcheck } from "../controllers/healthcheck.controller.js"

// Create Express router instance
const router = Router();

// HEALTHCHECK ROUTES (Public - No authentication required)

// Application health check endpoint
router.route('/').get(healthcheck); // Check if API is running and healthy

export default router
/**
 * Healthcheck controller functions
 * Handles application health monitoring
 * 
 * Required packages:
 * - None (uses only custom utilities)
 */

import {ApiError} from "../utils/ApiError.js" // Custom API error class
import {ApiResponse} from "../utils/ApiResponse.js" // Custom API response utility
import {asyncHandler} from "../utils/asyncHandler.js" // Custom async error handler

/**
 * Health check endpoint to verify API status
 * @route GET /api/v1/healthcheck
 * @access Public
 */
const healthcheck = asyncHandler(async (req, res) => {
    // Simple health check response
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                status: "OK",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || "development"
            },
            "API is healthy and running"
        )
    )
})

export {
    healthcheck
    }
    
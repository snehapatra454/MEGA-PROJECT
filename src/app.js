/**
 * Express application configuration and middleware setup
 * Configures CORS, body parsing, static files, and cookie handling
 * 
 * Required packages:
 * - express: Web framework for Node.js
 * - cors: Cross-Origin Resource Sharing middleware
 * - cookie-parser: Parse HTTP request cookies
 */

import express from "express" // npm install express
import cors from "cors" // npm install cors
import cookieParser from "cookie-parser" // npm install cookie-parser

// Create Express application instance
const app = express()

// Configure CORS middleware for cross-origin requests
app.use(cors({
    origin: process.env.CORS_ORIGIN, // Allow requests from specified origin
    credentials: true // Allow cookies to be sent with requests
}))

// Parse JSON requests with size limit
app.use(express.json({limit: "16kb"}))

// Parse URL-encoded requests with size limit
app.use(express.urlencoded({extended: true, limit: "16kb"}))

// Serve static files from public directory
app.use(express.static("public"))

// Parse cookies from requests
app.use(cookieParser())

export { app }
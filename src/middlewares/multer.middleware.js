/**
 * Multer middleware configuration for file uploads
 * Handles multipart/form-data for file upload functionality
 * 
 * Required packages:
 * - multer: Middleware for handling multipart/form-data (file uploads)
 */

import multer from "multer" // npm install multer

// Configure disk storage for uploaded files
const storage = multer.diskStorage({
    // Set destination folder for uploaded files
    destination: function (req, file, cb) {
        cb(null, './public/temp') // Store files in public/temp directory
    },
    // Set filename for uploaded files
    filename: function (req, file, cb) {
        // Keep original filename (could add unique suffix if needed)
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname)
    }
})

// Export configured multer instance
export const upload = multer({ 
    storage, // Use disk storage configuration
})
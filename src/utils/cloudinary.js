/**
 * Cloudinary configuration and file upload utility
 * Handles file uploads to Cloudinary cloud storage service
 * 
 * Required packages:
 * - cloudinary: Cloud-based image and video management service
 * - fs: Node.js built-in file system module
 */

import { v2 as cloudinary } from 'cloudinary'; // npm install cloudinary
import fs from "fs" // Built-in Node.js module

// Configure Cloudinary with environment variables
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file to Cloudinary cloud storage
 * @param {string} localFilePath - Path to the local file to upload
 * @returns {Promise<Object|null>} Cloudinary response object or null if failed
 */
const uploadOnCloudinary = async (localFilePath) => {
    try {
        // Return null if no file path provided
        if(!localFilePath) return null
        
        // Upload file to Cloudinary with auto resource type detection
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        
        // Log successful upload and return response
        console.log("File uploaded successfully to Cloudinary:", response.url);
        return response;
    }
    catch(error){
        // Remove local file if upload failed and return null
        fs.unlinkSync(localFilePath)
        return null
    }
}




    // const uploadResult = await cloudinary.uploader
    //    .upload(
    //        'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
    //            public_id: 'shoes',
    //        }
    //    )
    //    .catch((error) => {
    //        console.log(error);
    //    });
    
    // console.log(uploadResult);
    export {uploadOnCloudinary}
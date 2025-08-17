/**
 * Database connection configuration
 * Establishes connection to MongoDB using Mongoose
 * 
 * Required packages:
 * - mongoose: MongoDB object modeling for Node.js
 */

import mongoose from "mongoose"; // npm install mongoose
import {DB_NAME} from "../constants.js";

/**
 * Connects to MongoDB database
 * @returns {Promise<void>} Promise that resolves when connection is established
 */
const connectDB = async () => {
    try {
        // Connect to MongoDB using connection string from environment variables
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connection !! DB HOST: ${connectionInstance.connection.host}`);
    } catch(error){
        // Log error and exit process if connection fails
        console.log("MONGODB connection error",error);
        process.exit(1);
    }
}

export default connectDB
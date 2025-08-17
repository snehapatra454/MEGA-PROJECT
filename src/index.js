/**
 * Main entry point for the video streaming application
 * Sets up the Express server and establishes database connection
 * 
 * Required packages:
 * - dotenv: Environment variable management
 * - express: Web framework for Node.js
 */

// Import required modules
import dotenv from "dotenv" // npm install dotenv
import connectDB from "./db/index.js";
import express from "express"; // npm install express

// Create Express application instance
const app = express()

// Load environment variables from .env file
dotenv.config({
    path: './env'
})

// Connect to MongoDB database and start the server
connectDB()
.then(() => {
    // Start server on specified port or default to 8000
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    // Handle database connection errors
    console.log("MONGODB connection failed !!!",err);
})



/*import express from "express";
const app = express()

( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI} /${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR:", error);
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch(error) {
        console.error("ERROR: ",error)
        throw error
    }
})()*/
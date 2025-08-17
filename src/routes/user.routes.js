/**
 * User routes configuration
 * Defines API endpoints for user-related operations
 * 
 * Required packages:
 * - express: Web framework for Node.js (Router functionality)
 */

import {Router} from "express" // npm install express
import { registerUser } from "../controllers/user.controllers"

// Create Express router instance
const router = Router()

// Define user registration route
router.route("/register").post(registerUser)

export default router
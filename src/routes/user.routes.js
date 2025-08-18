/**
 * User routes configuration
 * Defines API endpoints for user-related operations
 * 
 * Required packages:
 * - express: Web framework for Node.js (Router functionality)
 */

import {Router} from "express" // npm install express
import { registerUser } from "../controllers/user.controllers.js"
import {upload} from "../middlewares/multer.middleware.js"

// Create Express router instance
const router = Router()

// Define user registration route
router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1},
        {name: "coverImage", maxCount: 1}
    ]),
    registerUser
)

export default router
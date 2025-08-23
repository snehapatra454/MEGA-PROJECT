/**
 * Playlist routes configuration
 * Defines API endpoints for playlist-related operations
 * 
 * Required packages:
 * - express: Web framework for Node.js (Router functionality)
 */

import { Router } from 'express'; // npm install express
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth..middleware.js" // Fixed import path

// Create Express router instance
const router = Router();

// Apply JWT verification middleware to all routes in this file
router.use(verifyJWT); // All playlist routes require authentication

// PLAYLIST ROUTES

// Create new playlist
router.route("/").post(createPlaylist);

// Individual playlist management
router
    .route("/:playlistId")
    .get(getPlaylistById) // Get playlist by ID
    .patch(updatePlaylist) // Update playlist details
    .delete(deletePlaylist); // Delete playlist

// Video management in playlists
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist); // Add video to playlist
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist); // Remove video from playlist

// Get user playlists
router.route("/user/:userId").get(getUserPlaylists);

export default router
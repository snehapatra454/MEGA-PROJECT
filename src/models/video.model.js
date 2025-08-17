/**
 * Video model schema for the video streaming application
 * Defines video structure with metadata and ownership
 * 
 * Required packages:
 * - mongoose: MongoDB object modeling for Node.js
 * - mongoose-aggregate-paginate-v2: Pagination plugin for Mongoose aggregation
 */

import mongoose, {Schema} from "mongoose"; // npm install mongoose
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // npm install mongoose-aggregate-paginate-v2

// Define video schema with validation
const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // Cloudinary URL for video file
            required: true
        },
        thumbnail: {
            type: String, // Cloudinary URL for video thumbnail
            required: true
        },
        title: {
            type: String, // Video title
            required: true
        },
        description: {
            type: String, // Video description
            required: true
        },
        duration: {
            type: Number, // Video duration in seconds
            required: true
        },
        views: {
            type: Number, // Number of views
            default: 0
        },
        isPublished: {
            type: Boolean, // Publication status
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId, // Reference to User who uploaded the video
            ref: "User"
        }
    }, {timestamps: true} // Automatically add createdAt and updatedAt
)

// Add pagination plugin for aggregation queries
videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)
import mongoose, {Schema} from "mongoose"; // npm install mongoose
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // npm install mongoose-aggregate-paginate-v2
import {User} from "./user.model.js" // User model for reference
import {Video} from "./video.model.js" // Video model for reference

const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true}) // Automatically add createdAt and updatedAt

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment", commentSchema)   
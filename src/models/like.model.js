import mongoose, {Schema} from "mongoose"; // npm install mongoose

const likeSchema = new Schema({
    video:{
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    comment:{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet:{
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    likedBy:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true}) // Automatically add createdAt and updatedAt

export const Like = mongoose.model("Like", likeSchema)
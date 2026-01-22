import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        minlenght:3
    },
    description:{
        type:String,
        required:true,
        minlenght:3
    },
    postedBy:{
        // relationship with user ( 1 to many means one user can post many posts)
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    
},{timestamps:true}
)

const postModel = mongoose.model("Post",postSchema)

export default postModel

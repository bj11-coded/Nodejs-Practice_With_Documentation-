import mongoose from "mongoose";

const AuthorSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    books:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Book"
        }
    ]

},{timestamps:true})

export default mongoose.model("Author",AuthorSchema)
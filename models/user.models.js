import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        min: 3,
    },
    email:{
        type:String,
        required:true,
        unique: true,
    },
    password:{
        type:String,
        required:true,
        min:8,
    },
    dateOfBirth:{
        type:Date,
        required:true,
    },
    address:{
        type:String,
        required:true,
    },
    gender:{
        type:String,
        enum:['Male', 'Female','Other'],  // multiple values that can be selected from given data
        required: true
    },
    profileImage: {
      url: { type: String },
      publicId: { type: String },
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
},{timestamps:true}

)

const userModel = mongoose.model("User", userSchema)

export default userModel
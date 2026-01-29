import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    name:String,
    permissions:[String],
})

const roleModel = mongoose.model("Role", roleSchema)

export default roleModel

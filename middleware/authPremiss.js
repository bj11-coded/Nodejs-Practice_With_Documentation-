import roleModel from "../models/role.models.js";
import userModel from "../models/user.models.js";

export const authPremiss = (permission) => {
    return async( req, res, next) =>{
        const role = await userModel.findById(req.user._id);
        
        await roleModel.findOne({name: role.role})
        .then((role) => {
            if(role.permissions.includes(permission)){
                next();
            }else{
                res.status(401).json({message: "No Permission for this role"});
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({message: "Internal Server Error"});
        })
    }
}

import cloudinary from "cloudinary";

//config the cloudinary
const cloudinaryConfig = async() =>{
    try{
        await cloudinary.config({
            cloud_name: process.env.CLOUDNAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET
        })
        console.log("Cloudinary Configured...")
    }
    catch(err){
        console.log(err.message || "Could not connect to cloudinary")
    }
}

export default cloudinaryConfig
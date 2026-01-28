import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

//config the cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
console.log("Cloudinary Configured...");

export default cloudinary;

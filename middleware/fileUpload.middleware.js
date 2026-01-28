import multer from "multer";
import fs from "fs"
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const uploadDir = 'uploads';

// find the directory if not exist create it
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// store the file in cloudnary
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "Images",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        resource_type: "image",
        overwrite: true,
    }
})
// store the file in local disk 
// const storage = multer.diskStorage({
//     // destination folder
//     destination: function (req, file, cb) {
//         console.log("the file is",file);
//         const files = `${uploadDir}/${file.fieldname}`;
//         console.log(files);
//         cb(null, files);
//     },
//     // file name which will be stored with a unique name
//     filename: function (req, file, cb) {
//         const uniqueName = `${Date.now()} + ${Math.round(Math.random() * 1E9)}-${file.originalname}`;
//         console.log(uniqueName);
//         cb(null, uniqueName);
//     }
// });

// fiter out which format file to be accepted
const filter = (req, file, cb) => { // cb = callback values 
    console.log(file);
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
     storage: cloudinaryStorage,
     fileFilter: filter,
     limits: {
        fileSize: 1024 * 1024 * 5 // less then 5mb file
     }
    });

export default upload;

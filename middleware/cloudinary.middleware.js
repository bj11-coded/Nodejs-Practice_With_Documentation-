import cloudinary from "cloudinary";



const clodudinaryMiddleware =  async(req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // file type check
    const allowedType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp','image/pdf']

    if(!allowedType.includes(file.mimetype)){
        return res.status(400).json({ message: "File type is not allowed" });
    }
    
    //file size limit 
    if(file.size > 1024 * 1024 * 5){ // 5mb
        return res.status(400).json({ message: "File size is too large" });
    }

    const upload = await cloudinary.v2.uploader.upload(file.path, {
      folder: "Images",
      resource_type: "image",
      overwrite: true,
    });
    req.file.filename = upload.filename;
    req.file.public_id = upload.public_id;
    next();
    
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Could not upload image" });
  }
};
 
export default clodudinaryMiddleware

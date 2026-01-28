# 05 - File Uploads with Cloudinary & Multer

This documentation covers the implementation of file uploads using **Multer**, **Cloudinary**, and **Express**. The system allows for uploading single or multiple images directly to Cloudinary storage.

## 1. Prerequisites / Dependencies

The following packages are used:

- `cloudinary`: The Cloudinary Node.js SDK.
- `multer`: Middleware for handling `multipart/form-data`.
- `multer-storage-cloudinary`: A Multer storage engine for Cloudinary.
- `dotenv`: For managing environment variables (API keys).

## 2. Configuration (`config/cloudinary.js`)

First, we configure the Cloudinary instance with credentials stored in environment variables.

```javascript
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export default cloudinary;
```

## 3. Middleware Setup (`middleware/fileUpload.middleware.js`)

We create a Multer instance that uses `CloudinaryStorage`. This middleware automatically handles the streaming of files to Cloudinary.

- **Storage**: Configured to upload to the "Images" folder on Cloudinary.
- **Allowed Formats**: JPG, PNG, JPEG, WEBP.
- **Filter**: Custom filter to ensure only image mimetypes are accepted.
- **Limits**: File size limited to 5MB.

```javascript
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Images",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    resource_type: "image",
    overwrite: true,
  },
});

const filter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: cloudinaryStorage,
  fileFilter: filter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
});

export default upload;
```

## 4. Controller Logic (`controllers/fileUpload.controllers.js`)

Instead of using the middleware directly in the route definition, we wrap it inside the controller methods. This allows for granular error handling (e.g., catching Multer errors like file size limits) directly within the Request/Response cycle.

### Single File Upload

Wraps `upload.single("image")`.

```javascript
fileUploadController.SingleFileUpload = (req, res) => {
  fileUpload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    // Success: req.file contains the Cloudinary result
    res.json({
      success: true,
      message: "File uploaded successfully",
      file: req.file,
    });
  });
};
```

### Multiple File Upload

Wraps `upload.array("image")`.

```javascript
fileUploadController.multipleFileUpload = (req, res) => {
  fileUpload.array("image")(req, res, (err) => {
    if (err)
      return res.status(400).json({ success: false, message: err.message });

    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    res.json({
      success: true,
      message: "Files uploaded successfully",
      files: req.files,
    });
  });
};
```

## 5. Routes (`routers/fileUpload.routes.js`)

The routes define the endpoints for the file uploads.

```javascript
import express from "express";
import fileUploadController from "../controllers/fileUpload.controllers.js";

const fileRouter = express.Router();

fileRouter.post("/single", fileUploadController.SingleFileUpload);
fileRouter.post("/multiple", fileUploadController.multipleFileUpload);

export default fileRouter;
```

## 6. App Integration (`index.js`)

Finally, the router is mounted in the main application file.

```javascript
import fileRouter from "./routers/fileUpload.routes.js";
// ...
app.use("/file", fileRouter);
```

### Usage

- **Single Upload**: `POST /file/single` with form-data `{ image: (file) }`
- **Multiple Upload**: `POST /file/multiple` with form-data `{ image: (files) }`

import fileUpload from "../middleware/fileUpload.middleware.js";

const fileUploadController = {};

fileUploadController.SingleFileUpload = (req, res) => {
  try {
    fileUpload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          message: err.message,
          success: false,
        });
      }
      res.json({
        message: "File uploaded successfully",
        success: true,
        file: req.file,
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

fileUploadController.multipleFileUpload = (req, res) => {
  try {
    fileUpload.array("image")(req, res, (err) => {
      // empty file Upload
      console.log(req.files);
      if (req.files.length === 0) {
        return res.status(400).json({
          message: "No file uploaded",
          success: false,
        });
      }
      if (err) {
        return res.status(400).json({
          message: err.message,
          success: false,
        });
      }
      res.json({
        message: "Files uploaded successfully",
        success: true,
        files: req.files,
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export default fileUploadController;

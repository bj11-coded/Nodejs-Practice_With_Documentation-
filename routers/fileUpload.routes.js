import express from "express";
import fileUploadController  from "../controllers/fileUpload.controllers.js";

const fileRouter = express.Router();

fileRouter.post("/single", fileUploadController.SingleFileUpload);
fileRouter.post("/multiple", fileUploadController.multipleFileUpload);


export default fileRouter;

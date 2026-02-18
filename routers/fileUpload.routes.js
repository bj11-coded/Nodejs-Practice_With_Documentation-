import express from "express";
import fileUploadController from "../controllers/fileUpload.controllers.js";

const fileRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: File Upload
 *   description: API for uploading files to Cloudinary
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadedFile:
 *       type: object
 *       properties:
 *         fieldname:
 *           type: string
 *           example: image
 *         originalname:
 *           type: string
 *           example: photo.jpg
 *         encoding:
 *           type: string
 *           example: 7bit
 *         mimetype:
 *           type: string
 *           example: image/jpeg
 *         path:
 *           type: string
 *           description: Cloudinary URL of the uploaded file
 *           example: https://res.cloudinary.com/demo/image/upload/v1234567890/Images/photo.jpg
 *         size:
 *           type: integer
 *           example: 204800
 *         filename:
 *           type: string
 *           description: Cloudinary public ID
 *           example: Images/photo
 */

/**
 * @swagger
 * /file/single:
 *   post:
 *     summary: Upload a single image file
 *     tags: [File Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (JPEG or PNG, max 5MB)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 file:
 *                   $ref: '#/components/schemas/UploadedFile'
 *       400:
 *         description: Bad request - invalid file type or upload error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Only JPEG and PNG files are allowed
 *                 success:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Internal Server Error
 */
fileRouter.post("/single", fileUploadController.SingleFileUpload);

/**
 * @swagger
 * /file/multiple:
 *   post:
 *     summary: Upload multiple image files
 *     tags: [File Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files to upload (JPEG or PNG, max 5MB each)
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Files uploaded successfully
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 files:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UploadedFile'
 *       400:
 *         description: Bad request - no files uploaded or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No file uploaded
 *                 success:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Internal Server Error
 */
fileRouter.post("/multiple", fileUploadController.multipleFileUpload);

export default fileRouter;

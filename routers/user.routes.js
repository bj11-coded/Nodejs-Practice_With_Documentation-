import userController from "../controllers/user.controllers.js";
import express from "express";
import authorization from "../middleware/auth.middleware.js";
import authController from "../controllers/auth.controllers.js";
import upload from "../middleware/fileUpload.middleware.js";
import { authRole } from "../middleware/authRole.js";
import { authPremiss } from "../middleware/authPremiss.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for Users
 */

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [ Users ]
 *     description: Get all users
 *     responses:
 *       200:
 *         description: Successfull retrived Users Data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                      type: String
 *                      example: 63421931289312
 *                   name:
 *                      type: String
 *                      example: Bijay Chaudhary
 *                   email:
 *                      type: String
 *                      example: xyz@gmail.com
 *                   role:
 *                      type: String
 *                      example: User
 *                   createdAt:
 *                      type: Date
 *                      example: 2022-01-01T00:00:00.000Z
 *                   updatedAt:
 *                      type: Date
 *                      example: 2022-01-01T00:00:00.000Z
 *       400:
 *         description: Bad Request the data has not been Submited Properly
 *       404:
 *         description: Not Found the data has not been found
 *       500:
 *         description: Internal Server Error the data has not been found
 *
 *
 *
 *
 *
 *
 *
 */

// all the CRUD Routes Here
router.get("/", userController.getAllUsers);
router.post("/", upload.single("profileImage"), userController.createUser);
router.delete(
  "/:id",
  authorization,
  authRole("User"),
  authPremiss("DELETE"),
  userController.deleteUser,
);

router.put("/:id", upload.single("profileImage"), userController.updateUser);
router.get("/:id", authorization, userController.getUserById);

// login

/**
 *  @swagger
 *  tags:
 *   name: Auth
 */

router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/change-password/:token", authController.changePassword);

export default router;

import userController from "../controllers/user.controllers.js";
import express from "express";
import authorization from "../middleware/auth.middleware.js";
import authController from "../controllers/auth.controllers.js";
import upload from "../middleware/fileUpload.middleware.js";
import { authRole } from "../middleware/authRole.js";
import { authPremiss } from "../middleware/authPremiss.js";

const router = express.Router();

// all the CRUD Routes Here 
router.get("/", userController.getAllUsers)
router.post("/", upload.single("profileImage"), userController.createUser)
router.delete("/:id",authorization, authRole("User"),authPremiss("DELETE"), userController.deleteUser)

router.put("/:id", upload.single("profileImage"), userController.updateUser)
router.get("/:id", authorization, userController.getUserById)


// login 
router.post("/login", authController.login)
router.post("/forgot-password", authController.forgotPassword)
router.post("/change-password/:token", authController.changePassword)

export default router

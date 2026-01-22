import userController from "../controllers/user.controllers.js";
import express from "express";
import authorization from "../middleware/auth.middleware.js";
import authController from "../controllers/auth.controllers.js";

const router = express.Router();

// all the CRUD Routes Here 
router.get("/", userController.getAllUsers)
router.post("/", userController.createUser)
router.delete("/:id", authorization, userController.deleteUser)
router.put("/:id", authorization, userController.updateUser)
router.get("/:id", authorization, userController.getUserById)

// login 
router.post("/login", authController.login)
router.post("/forgot-password", authController.forgotPassword)
router.post("/change-password/:token", authController.changePassword)

export default router

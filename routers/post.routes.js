import express from "express";
import postController from "../controllers/post.controllers.js";
// import {validatePost} from "../middleware/validation.js"

const router = express.Router();

router.get("/", postController.getAllPosts);
router.post("/", postController.createPost);
router.get("/", postController.getPostById);
router.put("/", postController.updatePost);
router.delete("/", postController.deletePost);

export default router;

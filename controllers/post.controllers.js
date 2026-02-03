import postModel from "../models/post.models.js";
import mongoose from "mongoose";

const postController = {};

postController.getAllPosts = async (req, res) => {
  try {
    const posts = await postModel
      .find()
      .populate("postedBy", "name, email, _id, gender");

    res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      payload: posts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

postController.createPost = async (req, res) => {
  try {
    const { title, description, postedBy } = req.body;
    // const postedBy = req.user._id;

    if (!title || !description || !postedBy) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const newPost = await postModel.create({ title, description, postedBy });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      payload: newPost
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

postController.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID"
      });
    }

    const post = await postModel.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      payload: post,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

postController.updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    const updatedPost = await postModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      payload: updatedPost,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

postController.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    const deletedPost = await postModel.findByIdAndDelete(id);
    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      payload: deletedPost,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export default postController;

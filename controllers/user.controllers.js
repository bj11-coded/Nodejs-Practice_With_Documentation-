import userModel from "../models/user.models.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";

const userController = {};

// GET ALL USERS
userController.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      payload: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// CREATE USER
userController.createUser = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, address, gender } = req.body;
    console.log(req.file);

    if ( !name || !email || !password || !dateOfBirth || !address || !gender || !req.file ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      dateOfBirth,
      address,
      gender,
      profileImage: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      payload: newUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE USER
userController.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await userModel.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      payload: deletedUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// UPDATE USER
userController.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await userModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if(!req.file){
      res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // delete the old image 
    if(updatedUser.profileImage.publicId){
      await cloudinary.v2.uploader.destroy(updatedUser.profileImage.publicId);
    }

    // upadte the new image
    updatedUser.profileImage = {
      url: req.file.path,
      publicId: req.file.filename,
    };

    await updatedUser.save();


    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      payload: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET USER BY ID
userController.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      payload: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export default userController;

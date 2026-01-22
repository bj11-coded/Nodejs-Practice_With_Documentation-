import userModel from "../models/user.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const authController = {};

authController.login = async (req, res) => {
  try {
    const { email, password } = await req.body;

    const user = await userModel.findOne({ email }).select("+password");
    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      res.status(400).json({
        message: "Invalid Credentials",
        success: false,
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRETKEY, {
      expiresIn: "1m",
    });

    res.status(201).json({
      message: "User Logged in Successfully...",
      success: true,
      payload: {
        data: { email: user.email, name: user.name, _id: user._id },
        token: token,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Something went Wrong!!! ",
      success: false,
    });
  }
};

// CHANGE PASSWORD or FORGOT PASSWORD

authController.forgotPassword = async (req, res) => {
  try {
    const email = await req.body.email;

    //find the email in database
    const existEmail = await userModel.findOne({ email });

    // if user not found
    if (!existEmail) {
      res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // token generation (expires in 1 hour)
    const token = jwt.sign({ _id: existEmail._id }, process.env.JWT_SECRETKEY, {
      expiresIn: "1h",
    });

    // saving the token and expries of link
    existEmail.passwordResetToken = token;
    existEmail.passwordResetExpires = Date.now() + 60 * 60 * 1000;

    await existEmail.save();

    // generate a link to send in the mail
    const link = `${process.env.BASE_URL}/users/change-password/${token}`;

    // send a mail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: existEmail.email,
      subject: "RESET PASSWORD",
      text: `Please click on the link to reset your password ${link}`,
    });

    res.status(201).json({
      message: "Password Reset Link Sent Successfully...",
      success: true,
      payload: { data: { email: existEmail.email } },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Something went Wrong!!! ",
      success: false,
    });
  }
};

authController.changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { token } = req.params;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        success: false,
      });
    }

    // Decode the JWT token to extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    console.log("Decoded token:", decoded);

    // Find user with matching ID, token, and valid expiry
    const user = await userModel.findOne({
      _id: decoded._id,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    console.log("User found:", user);

    if (!user) {
      return res.status(400).json({
        message: "Token expired or invalid",
        success: false,
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Something went wrong",
      success: false,
    });
  }
};

export default authController;

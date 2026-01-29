import userModel from "../models/user.models.js";

export const authRole = (role) => {
  try {
    return async (req, res, next) => {
      const user = await userModel.findById(req.user._id);
      const userRole = user.role;
      if (userRole === role) {
        next();
      } else {
        res.status(401).json({ message: "Access Denied for this role" });
      }
    };
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Something went Wrong!!! " });
  }
};

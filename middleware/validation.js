import Joi from "joi";

export const validateUser = (req, res, next) => {
  const { name, email, password, dateOfBirth, address, gender, role } =
    req.body;

  if (name.length < 3 && name.trim() == "") {
    res.status(400).json({
      success: false,
      message: "Name must be at least 3 characters long",
    });
  }

  if (name.charAt(0).toUpperCase() != name.charAt(0)) {
    res.status(400).json({
      success: false,
      message: "Name must start with an uppercase letter",
    });
  }

  if (!isNaN(name)) {
    res.status(400).json({
      success: false,
      message: "Name cannot be a number",
    });
  }

  // email validation

  let regExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email.match(regExp)) {
    res.status(400).json({
      success: false,
      message: "Email is not valid",
    });
  }

  // password validation
  let passRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  if (!password.match(passRegExp)) {
    res.status(400).json({
      success: false,
      message:
        "Password must be at least 8 characters long and must contain at least one uppercase letter, one lowercase letter and one number",
    });
  }

  next();
};

const postSchema = Joi.object({
  title: Joi.string().min(3).max(20).required(),
  description: Joi.string().min(3).max(300).required(),
  postedBy: Joi.string().required(),
});

export const validatePost = (req, res, next) => {
  try {
    const val = postSchema.validate(req.body);
    if (val.error) {
      return res.status(400).json({
        success: false,
        message: val.error.details[0].message,
      });
    }
    next();
  } catch (error) {
    console.log("Error Occurred", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

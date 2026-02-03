# Data Validation & Joi

This documentation covers the concepts of data validation in Node.js/Express applications, highlighting both manual validation techniques and the use of the **Joi** library for more efficient schema validation.

## 1. Why Validate Data?

Data validation is a critical security and integrity step in backend development. It ensures that the data received by the API:

- Adheres to expected formats (strings, numbers, emails, etc.).
- Meets specific constraints (min/max length, required fields).
- Is safe to process and store in the database.

Improper validation can lead to security vulnerabilities (like injection attacks), corrupted data, and application crashes.

## 2. Manual Validation

Before using libraries, validation can be implemented manually using JavaScript conditional statements and Regular Expressions (RegExp).

### Example: Manual User Validation

In our user validation middleware (`validateUser`), we manually check each field:

```javascript
export const validateUser = (req, res, next) => {
  const { name, email, password } = req.body;

  // Check name presence and length
  if (name.length < 3 && name.trim() == "") {
    return res.status(400).json({
      success: false,
      message: "Name must be at least 3 characters long",
    });
  }

  // Regex for Email Validation
  let regExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email.match(regExp)) {
    return res.status(400).json({
      success: false,
      message: "Email is not valid",
    });
  }

  // Regex for Password Strength
  let passRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  if (!password.match(passRegExp)) {
    return res.status(400).json({
      success: false,
      message: "Password must be strong...",
    });
  }

  next();
};
```

**Pros:**

- No external dependencies.
- Full control over logic.

**Cons:**

- Verbose and repetitive code.
- Harder to maintain complex schemas.
- "Reinventing the wheel" for common patterns (email, UUID, etc.).

## 3. Validation with Joi

**Joi** is a popular schema description language and data validator for JavaScript. It allows you to create blueprints (schemas) for your data and validates objects against them.

### How it works

1.  **Define a Schema**: Describe the shape of your data.
2.  **Validate**: Pass your data to the schema's `.validate()` method.

### Example: Joi Post Validation

Refactoring validation using Joi significantly simplifies the code.

#### Step 1: Define the Schema

We define a schema for a "Post" object, specifying types and constraints.

```javascript
import Joi from "joi";

const postSchema = Joi.object({
  // Title must be a string, min 3 chars, max 20 chars, and required
  title: Joi.string().min(3).max(20).required(),

  // Description must be a string, min 3 chars, max 300 chars, and required
  description: Joi.string().min(3).max(300).required(),

  // PostedBy must be a string (assuming ObjectId string) and required
  postedBy: Joi.string().required(),
});
```

#### Step 2: Create the Middleware

The middleware uses the schema to validate `req.body`.

```javascript
export const validatePost = (req, res, next) => {
  try {
    // Validate the request body against the schema
    const val = postSchema.validate(req.body);

    // Check if there is an error
    if (val.error) {
      return res.status(400).json({
        success: false,
        // Send a specific error message to the client
        message: val.error.details[0].message,
      });
    }

    // If valid, proceed to the controller
    next();
  } catch (error) {
    console.log("Error Occurred", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
```

### Key Joi Methods Used

- `Joi.string()`: Ensures the field is a string.
- `.min(x)` / `.max(x)`: Enforces length constraints.
- `.required()`: Marks the field as mandatory.
- `.validate(data)`: Performs the actual validation. Returns an object containing `value` (the validated data) and `error` (if validation failed).

## 4. Integration

This middleware is then applied to routes to protect them.

```javascript
// routers/post.routes.js
import { validatePost } from "../middleware/validation.js";

// Validate data before reaching the createPost controller
router.post("/", validatePost, postController.createPost);
```

## Summary

While manual validation works for simple cases, libraries like **Joi** provide a robust, readable, and scalable way to handle data validation in Express applications, ensuring that only valid data enters your business logic.

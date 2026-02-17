# Middleware Chaining & Advanced Routing Patterns

This documentation covers advanced middleware chaining techniques, route protection patterns, and how to compose multiple middleware functions to create secure, maintainable Express routes.

## 1. What is Middleware Chaining?

**Middleware chaining** is the practice of passing multiple middleware functions to a single route handler. Each middleware executes in sequence, and can either:

- **Pass control** to the next middleware using `next()`
- **Terminate the request** by sending a response
- **Handle errors** and pass them to error handlers

### Basic Syntax

```javascript
router.get("/path", middleware1, middleware2, middleware3, controller);
```

Each function receives `(req, res, next)` and must call `next()` to continue the chain.

## 2. Why Chain Middleware?

Middleware chaining provides several benefits:

1. **Separation of Concerns**: Each middleware handles one specific task
2. **Reusability**: Middleware can be reused across multiple routes
3. **Composability**: Build complex authorization logic from simple pieces
4. **Maintainability**: Easy to add/remove security layers
5. **Readability**: Route definitions clearly show what protections are in place

## 3. Common Middleware Chain Patterns

### Pattern 1: Authentication → Authorization → Controller

This is the most common pattern for protected routes.

```javascript
router.delete(
  "/:id",
  authorization, // 1. Verify user is logged in
  authRole("Admin"), // 2. Verify user has correct role
  authPremiss("DELETE"), // 3. Verify user has permission
  userController.deleteUser, // 4. Execute business logic
);
```

**Execution Flow:**

1. `authorization`: Checks JWT token, attaches `req.user`
2. `authRole`: Checks if `req.user.role === "Admin"`
3. `authPremiss`: Checks if user's role has "DELETE" permission
4. `deleteUser`: Executes the actual deletion

### Pattern 2: File Upload → Validation → Controller

For routes that handle file uploads with validation.

```javascript
router.post(
  "/",
  upload.single("profileImage"), // 1. Handle file upload
  validateUser, // 2. Validate request data
  userController.createUser, // 3. Create user
);
```

### Pattern 3: Multiple Validations

Chain multiple validation middleware for complex requirements.

```javascript
router.put(
  "/:id",
  authorization, // 1. Authentication
  validateObjectId, // 2. Validate ID format
  validateUpdateData, // 3. Validate request body
  checkOwnership, // 4. Verify user owns resource
  userController.updateUser, // 5. Update
);
```

## 4. Detailed Middleware Examples

### A. Authentication Middleware

Verifies the user is logged in by checking JWT tokens.

**File:** `middleware/auth.middleware.js`

```javascript
import jwt from "jsonwebtoken";
import userModel from "../models/user.models.js";

const authorization = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch user and attach to request
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 4. Attach user to request object for next middleware
    req.user = user;

    // 5. Pass control to next middleware
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authorization;
```

**Key Points:**

- Extracts and verifies JWT token
- Attaches `req.user` for downstream middleware
- Returns 401 if authentication fails

### B. Role-Based Authorization

Checks if the authenticated user has a specific role.

**File:** `middleware/authRole.js`

```javascript
import userModel from "../models/user.models.js";

export const authRole = (role) => {
  // Returns a middleware function (closure pattern)
  return async (req, res, next) => {
    try {
      // 1. Fetch user (already authenticated by previous middleware)
      const user = await userModel.findById(req.user._id);
      const userRole = user.role;

      // 2. Check if user's role matches required role
      if (userRole === role) {
        next(); // Allow access
      } else {
        res.status(403).json({
          success: false,
          message: "Access Denied for this role",
        });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message || "Something went wrong",
      });
    }
  };
};
```

**Key Points:**

- Uses **factory pattern** - returns a configured middleware
- Depends on `req.user` from authentication middleware
- Returns 403 (Forbidden) if role doesn't match

### C. Permission-Based Authorization

Checks if the user's role has a specific permission.

**File:** `middleware/authPremiss.js`

```javascript
import roleModel from "../models/role.models.js";
import userModel from "../models/user.models.js";

export const authPremiss = (permission) => {
  return async (req, res, next) => {
    try {
      // 1. Get user's role
      const user = await userModel.findById(req.user._id);

      // 2. Find the Role document
      const role = await roleModel.findOne({ name: user.role });

      if (!role) {
        return res.status(500).json({
          success: false,
          message: "Role not found",
        });
      }

      // 3. Check if role has the required permission
      if (role.permissions.includes(permission)) {
        next(); // Allow access
      } else {
        res.status(403).json({
          success: false,
          message: "No Permission for this role",
        });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
};
```

**Key Points:**

- More granular than role-based auth
- Checks permissions array in Role document
- Allows flexible permission management

### D. File Upload Middleware

Handles multipart/form-data file uploads.

**File:** `middleware/fileUpload.middleware.js`

```javascript
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Configure Cloudinary storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Images",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    resource_type: "image",
    overwrite: true,
  },
});

// File filter
const filter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true); // Accept file
  } else {
    cb(null, false); // Reject file
  }
};

// Create multer instance
const upload = multer({
  storage: cloudinaryStorage,
  fileFilter: filter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
});

export default upload;
```

**Key Points:**

- Processes file before it reaches the controller
- Uploads to Cloudinary automatically
- Attaches file info to `req.file` or `req.files`

## 5. Real-World Route Examples

### Example 1: Public Route (No Protection)

```javascript
// Anyone can access
router.get("/", userController.getAllUsers);
```

### Example 2: Authenticated Route

```javascript
// Must be logged in
router.get("/:id", authorization, userController.getUserById);
```

### Example 3: Role-Protected Route

```javascript
// Must be logged in AND have "Admin" role
router.delete(
  "/:id",
  authorization,
  authRole("Admin"),
  userController.deleteUser,
);
```

### Example 4: Permission-Protected Route

```javascript
// Must be logged in, have "User" role, AND have "DELETE" permission
router.delete(
  "/:id",
  authorization,
  authRole("User"),
  authPremiss("DELETE"),
  userController.deleteUser,
);
```

### Example 5: File Upload with Authentication

```javascript
// Must be logged in, upload file, then create user
router.post(
  "/",
  authorization,
  upload.single("profileImage"),
  userController.createUser,
);
```

### Example 6: Complex Multi-Layer Protection

```javascript
// Full protection stack
router.put(
  "/:id",
  authorization, // 1. Must be logged in
  validateObjectId, // 2. ID must be valid
  authRole("Admin"), // 3. Must be Admin
  authPremiss("UPDATE"), // 4. Must have UPDATE permission
  upload.single("profileImage"), // 5. Handle file upload
  validateUserUpdate, // 6. Validate request data
  userController.updateUser, // 7. Execute update
);
```

## 6. Middleware Factory Pattern

The **factory pattern** allows you to create configurable middleware.

### Why Use Factories?

Instead of creating separate middleware for each role:

```javascript
// ❌ BAD: Repetitive
const authAdmin = (req, res, next) => {
  /* check if admin */
};
const authUser = (req, res, next) => {
  /* check if user */
};
const authModerator = (req, res, next) => {
  /* check if moderator */
};
```

Use a factory that accepts parameters:

```javascript
// ✅ GOOD: Reusable
const authRole = (role) => {
  return (req, res, next) => {
    if (req.user.role === role) {
      next();
    } else {
      res.status(403).json({ message: "Access Denied" });
    }
  };
};

// Usage
router.delete("/admin", authRole("Admin"), controller);
router.delete("/user", authRole("User"), controller);
```

### Factory Pattern Structure

```javascript
export const middlewareFactory = (config) => {
  // Setup code runs once when middleware is defined
  const processedConfig = processConfig(config);

  // Return the actual middleware function
  return async (req, res, next) => {
    // This runs on every request
    try {
      // Use processedConfig
      const result = await checkSomething(req, processedConfig);

      if (result) {
        next();
      } else {
        res.status(403).json({ message: "Access Denied" });
      }
    } catch (error) {
      next(error);
    }
  };
};
```

## 7. Error Handling in Middleware Chains

### Passing Errors Down the Chain

```javascript
const middleware = async (req, res, next) => {
  try {
    // Some async operation
    await doSomething();
    next();
  } catch (error) {
    // Pass error to error-handling middleware
    next(error);
  }
};
```

### Error Handler Middleware

```javascript
// Must have 4 parameters to be recognized as error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});
```

## 8. Best Practices

### ✅ DO:

1. **Order matters**: Place middleware in logical order (auth → validation → business logic)
2. **Always call next()**: Unless you're sending a response
3. **Use factories**: For configurable middleware (roles, permissions)
4. **Handle errors**: Use try-catch and pass errors to error handlers
5. **Keep middleware focused**: Each middleware should do one thing
6. **Attach data to req**: Share data between middleware via `req.user`, `req.file`, etc.

### ❌ DON'T:

1. **Don't forget next()**: Forgetting `next()` will hang the request
2. **Don't send multiple responses**: Only one middleware should send a response
3. **Don't modify res directly**: Use `res.json()`, `res.send()`, etc.
4. **Don't put business logic in middleware**: Keep it in controllers
5. **Don't ignore errors**: Always handle or pass errors

## 9. Debugging Middleware Chains

### Add Logging Middleware

```javascript
const logger = (name) => (req, res, next) => {
  console.log(`[${name}] Processing ${req.method} ${req.path}`);
  next();
};

router.delete(
  "/:id",
  logger("Start"),
  authorization,
  logger("After Auth"),
  authRole("Admin"),
  logger("After Role Check"),
  userController.deleteUser,
);
```

### Check Middleware Order

```javascript
// ❌ WRONG: Validation before authentication
router.post(
  "/",
  validateUser, // Can't validate without knowing who the user is
  authorization,
  createUser,
);

// ✅ CORRECT: Authentication first
router.post("/", authorization, validateUser, createUser);
```

## 10. Summary

Middleware chaining is a powerful pattern in Express that allows you to:

- **Compose complex authorization logic** from simple, reusable pieces
- **Separate concerns** by keeping authentication, validation, and business logic separate
- **Create flexible, maintainable routes** that clearly express their requirements
- **Build security layers** that protect your application

The key is to understand the **order of execution**, properly use **next()**, and leverage **factory patterns** for configurable middleware.

### Common Chain Pattern

```javascript
router.METHOD(
  "/path",
  authentication, // Who are you?
  authorization, // Are you allowed?
  validation, // Is your data valid?
  businessLogic, // Do the thing
);
```

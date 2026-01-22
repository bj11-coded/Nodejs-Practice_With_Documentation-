# Node.js REST API - Learning Journey Documentation

> **A comprehensive guide documenting our journey from setup to building a production-ready REST API with Node.js, Express, MongoDB, and JWT authentication.**

---

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Setup](#project-setup)
4. [Project Architecture](#project-architecture)
5. [Database Connection](#database-connection)
6. [Models & Schemas](#models--schemas)
7. [Controllers](#controllers)
8. [Routing](#routing)
9. [Middleware](#middleware)
10. [Authentication & Authorization](#authentication--authorization)
11. [Password Reset Flow](#password-reset-flow)
12. [API Endpoints](#api-endpoints)
13. [Best Practices Learned](#best-practices-learned)
14. [Common Issues & Solutions](#common-issues--solutions)
15. [Testing the API](#testing-the-api)
16. [Environment Variables](#environment-variables)

---

## 🎯 Project Overview

This project is a **RESTful API** built with Node.js and Express, featuring:

- User authentication with JWT
- Password reset functionality with email
- CRUD operations for Users and Posts
- MongoDB database integration
- Middleware for authorization
- Secure password hashing with bcrypt

---

## 🛠 Technology Stack

| Technology     | Version | Purpose                    |
| -------------- | ------- | -------------------------- |
| **Node.js**    | Latest  | JavaScript runtime         |
| **Express**    | ^5.2.1  | Web framework              |
| **MongoDB**    | Latest  | NoSQL database             |
| **Mongoose**   | ^9.1.3  | MongoDB ODM                |
| **JWT**        | ^9.0.3  | Token-based authentication |
| **bcryptjs**   | ^3.0.3  | Password hashing           |
| **Nodemailer** | ^7.0.12 | Email service              |
| **dotenv**     | ^17.2.3 | Environment variables      |
| **Nodemon**    | ^3.1.11 | Development auto-reload    |

---

## 🚀 Project Setup

### Initial Setup Steps

1. **Initialize the project:**

```bash
npm init -y
```

2. **Install dependencies:**

```bash
npm install express mongoose jsonwebtoken bcryptjs nodemailer dotenv
```

3. **Install dev dependencies:**

```bash
npm install --save-dev nodemon
```

4. **Configure package.json:**

```json
{
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

### Why ES6 Modules?

We use `"type": "module"` to enable ES6 import/export syntax instead of CommonJS require/module.exports.

**Benefits:**

- Modern JavaScript syntax
- Better tree-shaking
- Cleaner code organization
- Native browser compatibility

---

## 🏗 Project Architecture

```
Rest api/
├── controllers/          # Business logic
│   ├── auth.controllers.js
│   ├── user.controllers.js
│   ├── post.controllers.js
│   ├── author.controllers.js
│   └── book.controllers.js
├── database/            # Database configuration
│   └── database.js
├── middleware/          # Custom middleware
│   └── auth.middleware.js
├── models/              # Mongoose schemas
│   ├── user.models.js
│   ├── post.models.js
│   ├── author.models.js
│   └── book.models.js
├── routers/             # Route definitions
│   ├── user.routes.js
│   ├── post.routes.js
│   ├── author.routes.js
│   └── book.routes.js
├── .env                 # Environment variables
├── index.js             # Entry point
└── package.json         # Dependencies
```

### MVC Pattern

We follow the **Model-View-Controller** pattern:

- **Models**: Define data structure (Mongoose schemas)
- **Controllers**: Handle business logic
- **Routes**: Define API endpoints and connect to controllers

---

## 🗄 Database Connection

### database/database.js

```javascript
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.log(err || "Something went wrong");
  }
};

export default connectDB;
```

### Key Learnings:

1. **Async/Await**: Database connections are asynchronous operations
2. **Error Handling**: Always wrap DB operations in try-catch
3. **Environment Variables**: Never hardcode connection strings
4. **Connection String Format**:
   ```
   mongodb://localhost:27017/database_name
   // OR for MongoDB Atlas:
   mongodb+srv://username:password@cluster.mongodb.net/database_name
   ```

---

## 📊 Models & Schemas

### User Model (models/user.models.js)

```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 8,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true },
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
```

### Post Model (models/post.models.js)

```javascript
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
    },
    description: {
      type: String,
      required: true,
      minlength: 3,
    },
    postedBy: {
      // Relationship with User (One-to-Many)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const postModel = mongoose.model("Post", postSchema);

export default postModel;
```

### Schema Best Practices:

1. **Validation**: Use built-in validators (required, min, max, enum)
2. **Timestamps**: `{timestamps: true}` adds createdAt and updatedAt automatically
3. **References**: Use `ObjectId` with `ref` for relationships
4. **Unique Fields**: Add `unique: true` for fields like email
5. **Enums**: Restrict values to specific options

---

## 🎮 Controllers

Controllers contain the business logic for handling requests.

### User Controller Example (controllers/user.controllers.js)

```javascript
import userModel from "../models/user.models.js";
import bcrypt from "bcryptjs";

const userController = {};

// Get all users
userController.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.status(200).json({
      message: "Users fetched successfully",
      success: true,
      payload: { data: users },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Something went wrong",
      success: false,
    });
  }
};

// Create user
userController.createUser = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, address, gender } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create new user
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      dateOfBirth,
      address,
      gender,
    });

    res.status(201).json({
      message: "User created successfully",
      success: true,
      payload: { data: { email: newUser.email, name: newUser.name } },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Something went wrong",
      success: false,
    });
  }
};

// Get user by ID
userController.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      success: true,
      payload: { data: user },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Something went wrong",
      success: false,
    });
  }
};

// Update user
userController.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow password updates through this endpoint
    delete updates.password;

    const updatedUser = await userModel
      .findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "User updated successfully",
      success: true,
      payload: { data: updatedUser },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Something went wrong",
      success: false,
    });
  }
};

// Delete user
userController.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await userModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Something went wrong",
      success: false,
    });
  }
};

export default userController;
```

### Controller Best Practices:

1. **Always use try-catch**: Handle errors gracefully
2. **Return early**: Use early returns for error conditions
3. **Consistent response format**: Always include `message`, `success`, and `payload`
4. **Validate input**: Check for required fields and valid data
5. **Don't expose passwords**: Use `.select("-password")` when fetching users
6. **Use appropriate status codes**:
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 404: Not Found
   - 500: Server Error

---

## 🛣 Routing

### User Routes (routers/user.routes.js)

```javascript
import userController from "../controllers/user.controllers.js";
import express from "express";
import authorization from "../middleware/auth.middleware.js";
import authController from "../controllers/auth.controllers.js";

const router = express.Router();

// CRUD Routes
router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);
router.delete("/:id", authorization, userController.deleteUser);
router.put("/:id", authorization, userController.updateUser);
router.get("/:id", authorization, userController.getUserById);

// Authentication Routes
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/change-password/:token", authController.changePassword);

export default router;
```

### Routing Best Practices:

1. **RESTful conventions**:
   - GET: Retrieve data
   - POST: Create data
   - PUT/PATCH: Update data
   - DELETE: Remove data

2. **Route parameters**: Use `:id` for dynamic values
3. **Middleware**: Apply authorization where needed
4. **Route organization**: Group related routes together

---

## 🔐 Middleware

### Authorization Middleware (middleware/auth.middleware.js)

```javascript
import Jwt from "jsonwebtoken";

const authorization = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({
        message: "Token not found!!",
        success: false,
      });
    }

    const token = authHeader.split(" ")[1];
    const decodeToken = Jwt.verify(token, process.env.JWT_SECRETKEY);
    req.user = decodeToken;
    next();
  } catch (err) {
    res.status(401).json({
      message: "Unauthorized Access",
      success: false,
    });
  }
};

export default authorization;
```

### Middleware Concepts:

1. **Purpose**: Execute code before reaching the controller
2. **next()**: Pass control to the next middleware/controller
3. **req.user**: Attach decoded user data to request object
4. **Authorization Header Format**: `Bearer <token>`

---

## 🔑 Authentication & Authorization

### Login Controller (controllers/auth.controllers.js)

```javascript
authController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
        success: false,
      });
    }

    // Compare passwords
    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
        success: false,
      });
    }

    // Generate JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRETKEY, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "User Logged in Successfully",
      success: true,
      payload: {
        data: {
          email: user.email,
          name: user.name,
          _id: user._id,
        },
        token: token,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Something went wrong",
      success: false,
    });
  }
};
```

### JWT (JSON Web Token) Explained:

**What is JWT?**

- A secure way to transmit information between parties
- Contains three parts: Header, Payload, Signature
- Stateless authentication (no session storage needed)

**JWT Structure:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWY4YzNhMjRiOGE3ZDAwMWU4YjQ1NjciLCJpYXQiOjE3MTA4NTY2MTAsImV4cCI6MTcxMDg2MDIxMH0.signature
```

**How to use:**

1. Client sends credentials (email/password)
2. Server validates and generates JWT
3. Client stores token (localStorage/sessionStorage)
4. Client sends token in Authorization header for protected routes
5. Server verifies token and grants access

---

## 🔄 Password Reset Flow

### Complete Password Reset Implementation

#### 1. Forgot Password (controllers/auth.controllers.js)

```javascript
authController.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;

    // Find user by email
    const existEmail = await userModel.findOne({ email });

    if (!existEmail) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Generate JWT token (expires in 1 hour)
    const token = jwt.sign({ _id: existEmail._id }, process.env.JWT_SECRETKEY, {
      expiresIn: "1h",
    });

    // Save token and expiry to database
    existEmail.passwordResetToken = token;
    existEmail.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await existEmail.save();

    // Generate reset link
    const link = `${process.env.BASE_URL}/users/change-password/${token}`;

    // Send email
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
      message: "Password Reset Link Sent Successfully",
      success: true,
      payload: { data: { email: existEmail.email } },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Something went wrong",
      success: false,
    });
  }
};
```

#### 2. Change Password (controllers/auth.controllers.js)

```javascript
authController.changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { token } = req.params;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        success: false,
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(400).json({
          message: "Password reset link has expired. Please request a new one.",
          success: false,
        });
      }
      return res.status(400).json({
        message: "Invalid password reset link",
        success: false,
      });
    }

    // Find user with valid token
    const user = await userModel.findOne({
      _id: decoded._id,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token expired or invalid",
        success: false,
      });
    }

    // Hash new password
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
```

### Password Reset Flow Diagram:

```
1. User requests password reset
   ↓
2. Server generates JWT token with user ID
   ↓
3. Token saved to database with expiry time
   ↓
4. Email sent with reset link containing token
   ↓
5. User clicks link and submits new password
   ↓
6. Server verifies token (JWT + database check)
   ↓
7. Password updated and token cleared
```

### Key Security Measures:

1. **Token Expiration**: Both JWT and database expiry (1 hour)
2. **Token Verification**: Check JWT validity AND database record
3. **Password Hashing**: Use bcrypt with salt rounds
4. **Token Cleanup**: Clear token after successful reset
5. **Error Handling**: Specific messages for different failure scenarios

---

## 📡 API Endpoints

### User Endpoints

| Method | Endpoint                        | Auth Required | Description            |
| ------ | ------------------------------- | ------------- | ---------------------- |
| GET    | `/users`                        | No            | Get all users          |
| POST   | `/users`                        | No            | Create new user        |
| GET    | `/users/:id`                    | Yes           | Get user by ID         |
| PUT    | `/users/:id`                    | Yes           | Update user            |
| DELETE | `/users/:id`                    | Yes           | Delete user            |
| POST   | `/users/login`                  | No            | User login             |
| POST   | `/users/forgot-password`        | No            | Request password reset |
| POST   | `/users/change-password/:token` | No            | Reset password         |

### Post Endpoints

| Method | Endpoint     | Auth Required | Description     |
| ------ | ------------ | ------------- | --------------- |
| GET    | `/posts`     | No            | Get all posts   |
| POST   | `/posts`     | Yes           | Create new post |
| GET    | `/posts/:id` | Yes           | Get post by ID  |
| PUT    | `/posts/:id` | Yes           | Update post     |
| DELETE | `/posts/:id` | Yes           | Delete post     |

### Request/Response Examples

#### Create User

```bash
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "dateOfBirth": "1990-01-01",
  "address": "123 Main St",
  "gender": "Male"
}

# Response
{
  "message": "User created successfully",
  "success": true,
  "payload": {
    "data": {
      "email": "john@example.com",
      "name": "John Doe"
    }
  }
}
```

#### Login

```bash
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

# Response
{
  "message": "User Logged in Successfully",
  "success": true,
  "payload": {
    "data": {
      "email": "john@example.com",
      "name": "John Doe",
      "_id": "65f8c3a24b8a7d001e8b4567"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Protected Route (with Authorization)

```bash
GET /users/65f8c3a24b8a7d001e8b4567
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Response
{
  "message": "User fetched successfully",
  "success": true,
  "payload": {
    "data": {
      "_id": "65f8c3a24b8a7d001e8b4567",
      "name": "John Doe",
      "email": "john@example.com",
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "address": "123 Main St",
      "gender": "Male"
    }
  }
}
```

---

## ✅ Best Practices Learned

### 1. **Security**

- ✅ Never store passwords in plain text (use bcrypt)
- ✅ Use environment variables for sensitive data
- ✅ Implement JWT with expiration
- ✅ Validate and sanitize user input
- ✅ Use HTTPS in production
- ✅ Implement rate limiting for auth endpoints

### 2. **Code Organization**

- ✅ Follow MVC pattern
- ✅ Separate concerns (models, controllers, routes)
- ✅ Use meaningful variable names
- ✅ Keep functions small and focused
- ✅ DRY (Don't Repeat Yourself)

### 3. **Error Handling**

- ✅ Always use try-catch blocks
- ✅ Return appropriate HTTP status codes
- ✅ Provide meaningful error messages
- ✅ Log errors for debugging
- ✅ Don't expose sensitive information in errors

### 4. **Database**

- ✅ Use indexes for frequently queried fields
- ✅ Validate data at schema level
- ✅ Use references for relationships
- ✅ Enable timestamps for audit trails
- ✅ Handle connection errors gracefully

### 5. **API Design**

- ✅ Follow RESTful conventions
- ✅ Use consistent response format
- ✅ Version your API (/api/v1/)
- ✅ Document all endpoints
- ✅ Implement pagination for large datasets

### 6. **Performance**

- ✅ Use async/await for non-blocking operations
- ✅ Implement caching where appropriate
- ✅ Optimize database queries
- ✅ Use compression middleware
- ✅ Limit payload size

---

## 🐛 Common Issues & Solutions

### Issue 1: "Illegal arguments: string, undefined"

**Cause**: Missing `await` keyword before database query

```javascript
// ❌ Wrong
const user = userModel.findOne({ email });

// ✅ Correct
const user = await userModel.findOne({ email });
```

### Issue 2: "JWT expired"

**Cause**: Token expiration mismatch between JWT and database

```javascript
// ✅ Solution: Align expiration times
const token = jwt.sign({ _id: user._id }, SECRET, { expiresIn: "1h" });
user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
```

### Issue 3: Field name mismatch

**Cause**: Controller uses different field names than schema

```javascript
// ❌ Wrong (if schema has passwordResetToken)
user.passwordToken = token;

// ✅ Correct
user.passwordResetToken = token;
```

### Issue 4: "Can't set headers after they are sent"

**Cause**: Multiple responses sent for single request

```javascript
// ❌ Wrong
if (!user) {
  res.status(404).json({ message: "Not found" });
}
// Code continues...
res.status(200).json({ message: "Success" });

// ✅ Correct
if (!user) {
  return res.status(404).json({ message: "Not found" });
}
res.status(200).json({ message: "Success" });
```

### Issue 5: Password comparison fails

**Cause**: Comparing plain text with hashed password incorrectly

```javascript
// ❌ Wrong
if (password === user.password)

// ✅ Correct
const passwordMatch = bcrypt.compareSync(password, user.password)
if (passwordMatch)
```

### Issue 6: MongoDB connection fails

**Solutions**:

1. Check MongoDB is running: `mongod` or MongoDB Atlas connection
2. Verify connection string in `.env`
3. Check network access (whitelist IP in Atlas)
4. Ensure correct database name

---

## 🧪 Testing the API

### Using Postman

1. **Create a collection** for your API
2. **Set up environment variables**:
   - `baseUrl`: http://localhost:4000
   - `token`: (will be set after login)

3. **Test sequence**:
   ```
   1. Create User → POST {{baseUrl}}/users
   2. Login → POST {{baseUrl}}/users/login
      → Save token from response
   3. Get User → GET {{baseUrl}}/users/:id
      → Add Authorization: Bearer {{token}}
   4. Update User → PUT {{baseUrl}}/users/:id
   5. Delete User → DELETE {{baseUrl}}/users/:id
   ```

### Using cURL

```bash
# Create user
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "dateOfBirth": "1990-01-01",
    "address": "Test Address",
    "gender": "Male"
  }'

# Login
curl -X POST http://localhost:4000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get user (with token)
curl -X GET http://localhost:4000/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=4000
BASE_URL=http://localhost:4000

# Database
MONGO_URL=mongodb://localhost:27017/your_database_name
# OR for MongoDB Atlas:
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name

# JWT Secret (use a strong random string)
JWT_SECRETKEY=your_super_secret_jwt_key_here_make_it_long_and_random

# Email Configuration (for password reset)
EMAIL=your_email@gmail.com
PASSWORD=your_app_specific_password
```

### Gmail App Password Setup:

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate a new app password for "Mail"
4. Use this password in your `.env` file

**⚠️ Important**: Never commit `.env` to version control! Add it to `.gitignore`:

```
node_modules/
.env
.DS_Store
```

---

## 🎓 Key Learnings Summary

### Week 1: Foundation

- ✅ Set up Node.js project with Express
- ✅ Understood ES6 modules vs CommonJS
- ✅ Connected to MongoDB with Mongoose
- ✅ Created first REST API endpoints

### Week 2: Authentication

- ✅ Implemented user registration with password hashing
- ✅ Built login system with JWT
- ✅ Created authorization middleware
- ✅ Protected routes with Bearer tokens

### Week 3: Advanced Features

- ✅ Implemented password reset flow
- ✅ Integrated email service with Nodemailer
- ✅ Handled JWT expiration
- ✅ Debugged common async/await issues

### Week 4: Best Practices

- ✅ Organized code with MVC pattern
- ✅ Implemented proper error handling
- ✅ Used environment variables
- ✅ Followed RESTful conventions
- ✅ Added comprehensive documentation

---

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Server runs on `http://localhost:4000` with auto-reload

### Production Mode

```bash
npm start
```

### Verify Server is Running

Visit `http://localhost:4000` in your browser. You should see:

```
Welcome to Backend API
```

---

## 📝 Next Steps

### Potential Enhancements:

1. **Input Validation**: Add express-validator
2. **Rate Limiting**: Prevent brute force attacks
3. **Logging**: Implement Winston or Morgan
4. **Testing**: Add Jest/Mocha for unit tests
5. **API Documentation**: Use Swagger/OpenAPI
6. **File Upload**: Add multer for image uploads
7. **Pagination**: Implement for large datasets
8. **Search & Filtering**: Add query parameters
9. **CORS**: Configure for frontend integration
10. **Deployment**: Deploy to Heroku/Vercel/AWS

---

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [bcrypt Documentation](https://www.npmjs.com/package/bcryptjs)
- [Nodemailer Documentation](https://nodemailer.com/)
- [REST API Best Practices](https://restfulapi.net/)

---

## 👨‍💻 Author

**Learning Journey**: January 2026
**Project**: Node.js REST API with Authentication

---

## 📄 License

This project is for educational purposes.

---

**Happy Coding! 🎉**

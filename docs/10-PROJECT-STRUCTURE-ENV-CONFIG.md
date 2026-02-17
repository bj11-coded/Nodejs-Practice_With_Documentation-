# Environment Configuration & Project Structure

This documentation covers best practices for organizing a Node.js/Express project, managing environment variables, and structuring your codebase for scalability and maintainability.

## 1. Project Structure Overview

A well-organized project structure makes it easier to navigate, maintain, and scale your application.

### Recommended Structure

```
project-root/
├── config/              # Configuration files
│   ├── cloudinary.js    # Cloudinary setup
│   └── database.js      # Database connection
├── controllers/         # Request handlers (business logic)
│   ├── user.controllers.js
│   ├── auth.controllers.js
│   └── post.controllers.js
├── middleware/          # Custom middleware
│   ├── auth.middleware.js
│   ├── authRole.js
│   ├── authPremiss.js
│   ├── validation.js
│   └── fileUpload.middleware.js
├── models/              # Database schemas
│   ├── user.models.js
│   ├── post.models.js
│   └── role.models.js
├── routers/             # Route definitions
│   ├── user.routes.js
│   ├── post.routes.js
│   └── fileUpload.routes.js
├── docs/                # Documentation
│   ├── 01-NODEJS-FUNDAMENTALS.md
│   ├── 02-EXPRESS-DEEP-DIVE.md
│   └── ...
├── uploads/             # Local file storage (if not using cloud)
├── .env                 # Environment variables (NEVER commit)
├── .env.example         # Template for .env file
├── .gitignore           # Git ignore rules
├── index.js             # Application entry point
├── package.json         # Dependencies and scripts
└── README.md            # Project overview
```

## 2. Environment Variables with dotenv

Environment variables allow you to configure your application differently for development, testing, and production without changing code.

### Installation

```bash
npm install dotenv
```

### Setup

**File:** `.env` (Create in project root)

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/myapp
DB_NAME=nodejs_practice

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDNAME=your-cloud-name
API_KEY=your-api-key
API_SECRET=your-api-secret

# Email Service (if applicable)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### Loading Environment Variables

**File:** `index.js`

```javascript
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Now you can access them via process.env
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;
```

### Best Practices for .env

1. **Never commit .env to Git**

   ```gitignore
   # .gitignore
   .env
   node_modules/
   uploads/
   ```

2. **Create .env.example** as a template

   ```env
   # .env.example
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/dbname
   JWT_SECRET=change-this
   CLOUDNAME=your-cloudinary-name
   API_KEY=your-api-key
   API_SECRET=your-api-secret
   ```

3. **Use descriptive names**
   - ✅ `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_API_KEY`
   - ❌ `DB`, `SECRET`, `KEY`

4. **Validate required variables**

   ```javascript
   const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "CLOUDNAME"];

   requiredEnvVars.forEach((varName) => {
     if (!process.env[varName]) {
       throw new Error(`Missing required environment variable: ${varName}`);
     }
   });
   ```

## 3. Configuration Files

Centralize configuration logic in dedicated files.

### Database Configuration

**File:** `config/database.js`

```javascript
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

export default connectDB;
```

### Cloudinary Configuration

**File:** `config/cloudinary.js`

```javascript
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

console.log("Cloudinary Configured...");

export default cloudinary;
```

### Centralized Config Object (Advanced)

**File:** `config/index.js`

```javascript
import dotenv from "dotenv";

dotenv.config();

const config = {
  // Server
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || "7d",
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDNAME,
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
  },

  // CORS
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  },
};

export default config;
```

**Usage:**

```javascript
import config from "./config/index.js";

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
```

## 4. Folder Organization Principles

### Controllers

Controllers handle the business logic for each route.

**File:** `controllers/user.controllers.js`

```javascript
import userModel from "../models/user.models.js";

const userController = {};

// Get all users
userController.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user by ID
userController.getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default userController;
```

**Principles:**

- One controller per resource (users, posts, auth)
- Export an object with named methods
- Keep controllers focused on request/response handling
- Delegate complex logic to service layers (if needed)

### Models

Models define the data structure and validation.

**File:** `models/user.models.js`

```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: String,
      enum: ["User", "Admin", "Moderator"],
      default: "User",
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

const userModel = mongoose.model("User", userSchema);

export default userModel;
```

**Principles:**

- One model per collection
- Use schema validation
- Add indexes for frequently queried fields
- Use timestamps for audit trails

### Routers

Routers define the API endpoints and apply middleware.

**File:** `routers/user.routes.js`

```javascript
import express from "express";
import userController from "../controllers/user.controllers.js";
import authorization from "../middleware/auth.middleware.js";
import { authRole } from "../middleware/authRole.js";
import upload from "../middleware/fileUpload.middleware.js";

const router = express.Router();

// Public routes
router.get("/", userController.getAllUsers);
router.post("/", upload.single("profileImage"), userController.createUser);

// Protected routes
router.get("/:id", authorization, userController.getUserById);
router.put(
  "/:id",
  authorization,
  upload.single("profileImage"),
  userController.updateUser,
);
router.delete(
  "/:id",
  authorization,
  authRole("Admin"),
  userController.deleteUser,
);

export default router;
```

**Principles:**

- One router per resource
- Group related routes together
- Apply middleware at the route level
- Keep routes thin (delegate to controllers)

### Middleware

Middleware handles cross-cutting concerns.

**File:** `middleware/auth.middleware.js`

```javascript
import jwt from "jsonwebtoken";
import userModel from "../models/user.models.js";

const authorization = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authorization;
```

**Principles:**

- One file per middleware concern
- Export as default or named exports
- Keep middleware focused and reusable
- Use factory pattern for configurable middleware

## 5. Application Entry Point

**File:** `index.js`

```javascript
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";

// Import routes
import userRoutes from "./routers/user.routes.js";
import postRoutes from "./routers/post.routes.js";
import fileRouter from "./routers/fileUpload.routes.js";

// Import Swagger
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  }),
);

// Database connection
connectDB();

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Nodejs Practice API",
      version: "1.0.0",
      description: "Backend API with authentication, file uploads, and RBAC",
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ["./routers/*.routes.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/file", fileRouter);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the API",
    documentation: `http://localhost:${PORT}/api-docs`,
  });
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
});
```

## 6. Package.json Scripts

**File:** `package.json`

```json
{
  "name": "nodejs-practice",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "seed": "node role.seeder.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "dotenv": "^16.0.3",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "joi": "^17.9.0",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.37.0",
    "multer-storage-cloudinary": "^4.0.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^4.6.3",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

## 7. Git Ignore Best Practices

**File:** `.gitignore`

```gitignore
# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Uploads (if storing locally)
uploads/

# Build outputs
dist/
build/

# Testing
coverage/
```

## 8. Documentation Best Practices

### README.md Structure

````markdown
# Project Name

Brief description of what the project does.

## Features

- User authentication with JWT
- Role-based access control
- File uploads to Cloudinary
- RESTful API with Swagger documentation

## Prerequisites

- Node.js >= 14.x
- MongoDB >= 4.x
- Cloudinary account

## Installation

1. Clone the repository
   ```bash
   git clone <repo-url>
   cd project-name
   ```
````

2. Install dependencies

   ```bash
   npm install
   ```

3. Configure environment variables

   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. Start the server
   ```bash
   npm run dev
   ```

## API Documentation

Visit `http://localhost:4000/api-docs` for interactive API documentation.

## Project Structure

[Brief explanation of folder structure]

## License

MIT

```

## 9. Best Practices Summary

### ✅ DO:

1. **Use environment variables** for all configuration
2. **Organize by feature** (users, posts, auth)
3. **Keep files focused** (single responsibility)
4. **Document your code** (JSDoc, README, docs folder)
5. **Use consistent naming** (camelCase for variables, PascalCase for classes)
6. **Version control** everything except secrets
7. **Validate environment variables** on startup

### ❌ DON'T:

1. **Don't hardcode secrets** in source code
2. **Don't commit .env** files
3. **Don't mix concerns** (keep controllers, models, routes separate)
4. **Don't ignore errors** (always handle or log)
5. **Don't skip documentation** (future you will thank you)

## Summary

A well-structured project with proper environment configuration makes your application:

- **Easier to understand** for new developers
- **Simpler to maintain** as it grows
- **More secure** by separating secrets from code
- **Deployable** to different environments without code changes
- **Scalable** with clear separation of concerns

The key is to establish good patterns early and stick to them consistently throughout development.
```

# Swagger API Documentation

This documentation covers the implementation of **Swagger** (OpenAPI) for automatically generating interactive API documentation in a Node.js/Express application.

## 1. What is Swagger?

**Swagger** (now known as OpenAPI Specification) is a framework for describing and documenting RESTful APIs. It provides:

- **Interactive API Documentation**: A web UI where developers can test endpoints directly.
- **Auto-generated Documentation**: Documentation is generated from code annotations.
- **Standardization**: A common format for describing API structure, parameters, responses, etc.
- **Client SDK Generation**: Can be used to generate client libraries in various languages.

## 2. Why Use Swagger?

- **Developer Experience**: Frontend developers can easily understand and test your API.
- **Reduced Documentation Overhead**: No need to maintain separate documentation files.
- **Testing Interface**: Built-in UI to test endpoints without tools like Postman.
- **API Discovery**: Makes it easy for new team members to understand available endpoints.
- **Contract-First Development**: Can define API contracts before implementation.

## 3. Installation

Install the required packages:

```bash
npm install swagger-jsdoc swagger-ui-express
```

**Dependencies:**

- `swagger-jsdoc`: Generates Swagger specification from JSDoc comments in your code.
- `swagger-ui-express`: Serves the Swagger UI interface.

## 4. Basic Configuration

### Step 1: Configure Swagger in `index.js`

```javascript
import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();

// Swagger configuration options
const options = {
  swaggerDefinition: {
    openapi: "3.0.0", // OpenAPI version
    info: {
      title: "Nodejs Practice API",
      version: "1.0.0",
      description:
        "This Backend system is created to practice Nodejs with different third party packages",
    },
    servers: [{ url: "http://localhost:4000" }],
  },
  // Path to the API routes with Swagger annotations
  apis: ["./routers/*.routes.js"],
};

// Generate Swagger specification
const swagger = swaggerJSDoc(options);

// Serve Swagger UI at /api-docs endpoint
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swagger));
```

### Step 2: Access the Documentation

Once configured, navigate to:

```
http://localhost:4000/api-docs
```

You'll see an interactive UI with all documented endpoints.

## 5. Documenting Routes with JSDoc

Swagger uses **JSDoc comments** to extract API information. These comments are placed directly above route definitions.

### Basic Route Documentation

```javascript
/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     description: Get all users
 *     responses:
 *       200:
 *         description: Successfully retrieved Users Data
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.get("/", userController.getAllUsers);
```

### Key Components of Swagger Annotations

#### 1. **Tags** - Organize endpoints into groups

```javascript
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for Users
 */
```

#### 2. **Path and Method** - Define the endpoint

```javascript
/**
 * @swagger
 * /users/{id}:
 *   get:
 */
```

#### 3. **Parameters** - Define route/query/body parameters

```javascript
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 */
```

#### 4. **Request Body** - For POST/PUT requests

```javascript
/**
 * @swagger
 * /users/login:
 *   post:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 */
```

#### 5. **Responses** - Define expected responses

```javascript
/**
 * @swagger
 * /users:
 *   get:
 *     responses:
 *       200:
 *         description: Successfully retrieved Users Data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 63421931289312
 *                   name:
 *                     type: string
 *                     example: Bijay Chaudhary
 *                   email:
 *                     type: string
 *                     example: xyz@gmail.com
 *                   role:
 *                     type: string
 *                     example: User
 */
```

## 6. Complete Example: User Routes

**File:** `routers/user.routes.js`

```javascript
import express from "express";
import userController from "../controllers/user.controllers.js";
import authController from "../controllers/auth.controllers.js";
import authorization from "../middleware/auth.middleware.js";
import upload from "../middleware/fileUpload.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for Users
 */

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     description: Get all users
 *     responses:
 *       200:
 *         description: Successfully retrieved Users Data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 63421931289312
 *                   name:
 *                     type: string
 *                     example: Bijay Chaudhary
 *                   email:
 *                     type: string
 *                     example: xyz@gmail.com
 *                   role:
 *                     type: string
 *                     example: User
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2022-01-01T00:00:00.000Z
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.get("/", userController.getAllUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     description: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", upload.single("profileImage"), userController.createUser);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags: [Auth]
 *     description: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authController.login);

export default router;
```

## 7. Advanced Features

### Security Definitions (JWT Authentication)

Add security schemes to document protected endpoints:

```javascript
const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Nodejs Practice API",
      version: "1.0.0",
    },
    servers: [{ url: "http://localhost:4000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routers/*.routes.js"],
};
```

Then use it in protected routes:

```javascript
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 */
```

### Reusable Schemas

Define reusable schemas to avoid repetition:

```javascript
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 */

/**
 * @swagger
 * /users:
 *   get:
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
```

## 8. Best Practices

1. **Organize by Tags**: Group related endpoints using tags (Users, Auth, Posts, etc.).
2. **Document All Responses**: Include success and error responses with examples.
3. **Use Descriptive Names**: Make endpoint descriptions clear and concise.
4. **Include Examples**: Provide example values for request/response bodies.
5. **Document Authentication**: Clearly mark which endpoints require authentication.
6. **Keep It Updated**: Update Swagger docs when you modify routes.
7. **Use Schemas**: Define reusable schemas for common data structures.

## 9. Common Swagger Data Types

| Type                 | Description   | Example                      |
| -------------------- | ------------- | ---------------------------- |
| `string`             | Text data     | `"John Doe"`                 |
| `number`             | Numeric data  | `42`                         |
| `integer`            | Whole numbers | `10`                         |
| `boolean`            | True/False    | `true`                       |
| `array`              | List of items | `[1, 2, 3]`                  |
| `object`             | JSON object   | `{ "key": "value" }`         |
| `string (date-time)` | ISO date      | `"2022-01-01T00:00:00.000Z"` |
| `string (binary)`    | File upload   | File data                    |

## 10. Testing with Swagger UI

The Swagger UI provides an interactive interface where you can:

1. **View all endpoints** organized by tags
2. **See request/response schemas** with examples
3. **Try out endpoints** directly from the browser
4. **Test authentication** by adding Bearer tokens
5. **View response codes** and error messages

### How to Test an Endpoint:

1. Navigate to `http://localhost:4000/api-docs`
2. Click on an endpoint to expand it
3. Click "Try it out"
4. Fill in required parameters
5. Click "Execute"
6. View the response below

## Summary

Swagger provides a powerful, standardized way to document your APIs. By using JSDoc annotations directly in your route files, you can maintain documentation alongside your code, ensuring it stays up-to-date and accurate. The interactive UI makes it easy for developers to understand and test your API without needing external tools.

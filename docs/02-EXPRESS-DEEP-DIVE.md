# Express.js Deep Dive

## Table of Contents

1. [What is Express.js?](#what-is-expressjs)
2. [Setting Up Express](#setting-up-express)
3. [Routing in Detail](#routing-in-detail)
4. [Middleware Deep Dive](#middleware-deep-dive)
5. [Request & Response Objects](#request--response-objects)
6. [Error Handling](#error-handling)
7. [Template Engines](#template-engines)
8. [Static Files](#static-files)

---

## What is Express.js?

**Express.js** is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

### Why Express?

```javascript
// Without Express (Pure Node.js)
const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>Home</h1>");
  } else if (req.url === "/api/users" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ users: [] }));
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(3000);
```

```javascript
// With Express (Much cleaner!)
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("<h1>Home</h1>");
});

app.get("/api/users", (req, res) => {
  res.json({ users: [] });
});

app.listen(3000);
```

### Express Features

1. **Routing**: Define routes easily
2. **Middleware**: Modular request processing
3. **Template Engines**: Render dynamic HTML
4. **Static Files**: Serve CSS, JS, images
5. **Error Handling**: Centralized error management
6. **HTTP Utilities**: Simplified request/response handling

---

## Setting Up Express

### Installation

```bash
npm install express
```

### Basic Server

```javascript
// index.js
import express from "express";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Application Object (app)

The `app` object represents your Express application:

```javascript
const app = express();

// Application settings
app.set("view engine", "ejs");
app.set("views", "./views");
app.set("port", 3000);

// Get settings
const port = app.get("port");

// Enable/disable features
app.enable("trust proxy");
app.disable("x-powered-by");

// Check if enabled
if (app.enabled("trust proxy")) {
  console.log("Proxy enabled");
}
```

---

## Routing in Detail

### Basic Routing

```javascript
// HTTP Methods
app.get("/users", (req, res) => {
  res.send("GET request to /users");
});

app.post("/users", (req, res) => {
  res.send("POST request to /users");
});

app.put("/users/:id", (req, res) => {
  res.send(`PUT request to /users/${req.params.id}`);
});

app.delete("/users/:id", (req, res) => {
  res.send(`DELETE request to /users/${req.params.id}`);
});

// Handle all methods
app.all("/secret", (req, res) => {
  res.send("Accessing secret section");
});
```

### Route Parameters

```javascript
// Single parameter
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  res.send(`User ID: ${userId}`);
});

// Multiple parameters
app.get("/users/:userId/posts/:postId", (req, res) => {
  const { userId, postId } = req.params;
  res.json({ userId, postId });
});

// Optional parameters
app.get("/users/:id?", (req, res) => {
  if (req.params.id) {
    res.send(`User ${req.params.id}`);
  } else {
    res.send("All users");
  }
});

// Parameter validation
app.param("id", (req, res, next, id) => {
  // Validate ID
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  req.userId = parseInt(id);
  next();
});

app.get("/users/:id", (req, res) => {
  res.send(`Valid user ID: ${req.userId}`);
});
```

### Query Parameters

```javascript
// URL: /search?q=nodejs&limit=10&page=2
app.get("/search", (req, res) => {
  const { q, limit = 20, page = 1 } = req.query;

  res.json({
    query: q,
    limit: parseInt(limit),
    page: parseInt(page),
  });
});
```

### Route Patterns

```javascript
// Wildcard
app.get("/files/*", (req, res) => {
  res.send(`File path: ${req.params[0]}`);
});

// Regular expressions
app.get(/^\/users\/(\d+)$/, (req, res) => {
  res.send(`User ID: ${req.params[0]}`);
});

// Character classes
app.get("/ab?cd", (req, res) => {
  // Matches: /acd, /abcd
  res.send("Matched");
});

app.get("/ab+cd", (req, res) => {
  // Matches: /abcd, /abbcd, /abbbcd, etc.
  res.send("Matched");
});

app.get("/ab*cd", (req, res) => {
  // Matches: /abcd, /abXcd, /abRANDOMcd, etc.
  res.send("Matched");
});
```

### Router Object

```javascript
// routes/users.js
import express from "express";
const router = express.Router();

// Middleware specific to this router
router.use((req, res, next) => {
  console.log("Time:", Date.now());
  next();
});

// Define routes
router.get("/", (req, res) => {
  res.send("Users list");
});

router.get("/:id", (req, res) => {
  res.send(`User ${req.params.id}`);
});

router.post("/", (req, res) => {
  res.send("Create user");
});

export default router;
```

```javascript
// index.js
import userRoutes from "./routes/users.js";

app.use("/users", userRoutes);
// Now routes are: /users, /users/:id, etc.
```

### Route Chaining

```javascript
app
  .route("/users/:id")
  .get((req, res) => {
    res.send("Get user");
  })
  .put((req, res) => {
    res.send("Update user");
  })
  .delete((req, res) => {
    res.send("Delete user");
  });
```

---

## Middleware Deep Dive

### What is Middleware?

Middleware functions are functions that have access to:

- **Request object** (req)
- **Response object** (res)
- **Next middleware function** (next)

```javascript
// Middleware signature
function middleware(req, res, next) {
  // Do something
  next(); // Pass control to next middleware
}
```

### Middleware Flow

```
Request → Middleware 1 → Middleware 2 → Route Handler → Response
              ↓              ↓              ↓
           next()         next()         res.send()
```

### Types of Middleware

#### 1. Application-Level Middleware

```javascript
// Executed for every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Executed for specific path
app.use("/api", (req, res, next) => {
  console.log("API request");
  next();
});

// Multiple middleware functions
app.use(
  (req, res, next) => {
    console.log("First");
    next();
  },
  (req, res, next) => {
    console.log("Second");
    next();
  },
);
```

#### 2. Router-Level Middleware

```javascript
const router = express.Router();

router.use((req, res, next) => {
  console.log("Router middleware");
  next();
});

router.get("/users", (req, res) => {
  res.send("Users");
});

app.use("/api", router);
```

#### 3. Error-Handling Middleware

```javascript
// Must have 4 parameters
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message,
  });
});
```

#### 4. Built-in Middleware

```javascript
// Parse JSON
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static("public"));
```

#### 5. Third-Party Middleware

```javascript
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";

// CORS
app.use(cors());

// Security headers
app.use(helmet());

// Logging
app.use(morgan("combined"));

// Compression
app.use(compression());
```

### Custom Middleware Examples

#### Authentication Middleware

```javascript
function authenticate(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      error: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      error: "Invalid token",
    });
  }
}

// Use in routes
app.get("/protected", authenticate, (req, res) => {
  res.json({ user: req.user });
});
```

#### Logging Middleware

```javascript
function logger(req, res, next) {
  const start = Date.now();

  // Log after response is sent
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });

  next();
}

app.use(logger);
```

#### Request Validation Middleware

```javascript
function validateUser(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters",
    });
  }

  next();
}

app.post("/users", validateUser, (req, res) => {
  // Create user
});
```

#### Rate Limiting Middleware

```javascript
const rateLimit = {};

function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  if (!rateLimit[ip]) {
    rateLimit[ip] = { count: 1, resetTime: now + 60000 };
  } else if (now > rateLimit[ip].resetTime) {
    rateLimit[ip] = { count: 1, resetTime: now + 60000 };
  } else if (rateLimit[ip].count >= 100) {
    return res.status(429).json({
      error: "Too many requests",
    });
  } else {
    rateLimit[ip].count++;
  }

  next();
}

app.use("/api", rateLimiter);
```

### Middleware Order Matters!

```javascript
// ❌ Wrong order
app.get("/users", (req, res) => {
  res.json({ users: [] });
});

app.use(express.json()); // Too late!

// ✅ Correct order
app.use(express.json()); // Parse JSON first

app.get("/users", (req, res) => {
  res.json({ users: [] });
});
```

---

## Request & Response Objects

### Request Object (req)

```javascript
app.get("/demo", (req, res) => {
  // URL parameters
  console.log(req.params);

  // Query parameters
  console.log(req.query);

  // Request body
  console.log(req.body);

  // Headers
  console.log(req.headers);
  console.log(req.get("Content-Type"));

  // HTTP method
  console.log(req.method);

  // URL
  console.log(req.url);
  console.log(req.originalUrl);
  console.log(req.path);

  // Protocol
  console.log(req.protocol); // http or https

  // Hostname
  console.log(req.hostname);

  // IP address
  console.log(req.ip);

  // Cookies (requires cookie-parser)
  console.log(req.cookies);

  // Check content type
  console.log(req.is("json")); // true/false

  // Check if accepts
  console.log(req.accepts("html")); // true/false
  console.log(req.accepts(["json", "text"]));
});
```

### Response Object (res)

```javascript
app.get("/demo", (req, res) => {
  // Send response
  res.send("Hello");
  res.send({ message: "Hello" });
  res.send(Buffer.from("Hello"));

  // Send JSON
  res.json({ message: "Hello" });

  // Set status code
  res.status(404).send("Not Found");
  res.sendStatus(200); // Sends status text

  // Set headers
  res.set("Content-Type", "text/html");
  res.set({
    "Content-Type": "text/html",
    "X-Custom-Header": "value",
  });

  // Redirect
  res.redirect("/new-url");
  res.redirect(301, "/new-url"); // Permanent redirect
  res.redirect("back"); // Go back

  // Download file
  res.download("/path/to/file.pdf");
  res.download("/path/to/file.pdf", "custom-name.pdf");

  // Send file
  res.sendFile("/absolute/path/to/file.html");

  // Render template
  res.render("index", { title: "Home" });

  // Set cookie
  res.cookie("name", "value", {
    maxAge: 900000,
    httpOnly: true,
    secure: true,
  });

  // Clear cookie
  res.clearCookie("name");

  // End response
  res.end();

  // Chain methods
  res
    .status(200)
    .set("Content-Type", "application/json")
    .json({ message: "Success" });
});
```

### Content Negotiation

```javascript
app.get("/data", (req, res) => {
  res.format({
    "text/plain": () => {
      res.send("Plain text");
    },
    "text/html": () => {
      res.send("<h1>HTML</h1>");
    },
    "application/json": () => {
      res.json({ message: "JSON" });
    },
    default: () => {
      res.status(406).send("Not Acceptable");
    },
  });
});
```

---

## Error Handling

### Synchronous Errors

```javascript
app.get("/error", (req, res) => {
  throw new Error("Something went wrong!");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message,
  });
});
```

### Asynchronous Errors

```javascript
// ❌ Won't be caught
app.get("/async-error", (req, res) => {
  setTimeout(() => {
    throw new Error("Async error");
  }, 100);
});

// ✅ Proper async error handling
app.get("/async-error", async (req, res, next) => {
  try {
    const data = await fetchData();
    res.json(data);
  } catch (err) {
    next(err); // Pass to error handler
  }
});
```

### Custom Error Class

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Usage
app.get("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal Server Error";

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});
```

### 404 Handler

```javascript
// Must be after all routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});
```

---

## Template Engines

### EJS (Embedded JavaScript)

```bash
npm install ejs
```

```javascript
// Setup
app.set("view engine", "ejs");
app.set("views", "./views");

// Route
app.get("/", (req, res) => {
  res.render("index", {
    title: "Home",
    users: ["John", "Jane", "Bob"],
  });
});
```

```html
<!-- views/index.ejs -->
<!DOCTYPE html>
<html>
  <head>
    <title><%= title %></title>
  </head>
  <body>
    <h1><%= title %></h1>

    <ul>
      <% users.forEach(user => { %>
      <li><%= user %></li>
      <% }); %>
    </ul>

    <% if (users.length > 0) { %>
    <p>We have <%= users.length %> users</p>
    <% } else { %>
    <p>No users</p>
    <% } %>
  </body>
</html>
```

### Pug (formerly Jade)

```bash
npm install pug
```

```javascript
app.set("view engine", "pug");
```

```pug
//- views/index.pug
doctype html
html
  head
    title= title
  body
    h1= title
    ul
      each user in users
        li= user
```

---

## Static Files

```javascript
// Serve files from 'public' directory
app.use(express.static("public"));

// Now accessible:
// http://localhost:3000/css/style.css
// http://localhost:3000/js/app.js
// http://localhost:3000/images/logo.png

// Multiple static directories
app.use(express.static("public"));
app.use(express.static("files"));

// Virtual path prefix
app.use("/static", express.static("public"));
// http://localhost:3000/static/css/style.css

// Absolute path
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
```

---

## Complete Express Application Example

```javascript
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS
app.use(cors());

// Logging
app.use(morgan("dev"));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.get("/api/users", (req, res) => {
  res.json({ users: [] });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## Best Practices

1. ✅ **Use environment variables** for configuration
2. ✅ **Organize routes** in separate files
3. ✅ **Use middleware** for common functionality
4. ✅ **Handle errors** properly
5. ✅ **Validate input** before processing
6. ✅ **Use async/await** for cleaner code
7. ✅ **Set security headers** with helmet
8. ✅ **Enable CORS** when needed
9. ✅ **Log requests** for debugging
10. ✅ **Use compression** for production

---

## Summary

Express.js simplifies Node.js web development by providing:

- Clean routing system
- Powerful middleware architecture
- Easy request/response handling
- Template engine support
- Static file serving
- Error handling mechanisms

Master these concepts to build robust web applications!

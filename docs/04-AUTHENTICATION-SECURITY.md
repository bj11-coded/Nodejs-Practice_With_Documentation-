# Authentication & Security Deep Dive

## Table of Contents

1. [Authentication vs Authorization](#authentication-vs-authorization)
2. [Password Security](#password-security)
3. [JWT (JSON Web Tokens)](#jwt-json-web-tokens)
4. [Session-Based Authentication](#session-based-authentication)
5. [OAuth 2.0](#oauth-20)
6. [Security Best Practices](#security-best-practices)
7. [Common Vulnerabilities](#common-vulnerabilities)
8. [Rate Limiting](#rate-limiting)

---

## Authentication vs Authorization

### Authentication

**"Who are you?"** - Verifying the identity of a user

```javascript
// Login endpoint (Authentication)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // User is authenticated
  const token = generateToken(user);
  res.json({ token });
});
```

### Authorization

**"What can you do?"** - Verifying what an authenticated user can access

```javascript
// Authorization middleware
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden: Insufficient permissions",
      });
    }
    next();
  };
}

// Protected route with authorization
app.delete(
  "/users/:id",
  authenticate, // First authenticate
  authorize("admin"), // Then authorize
  async (req, res) => {
    // Only admins can delete users
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  },
);
```

---

## Password Security

### Why Hash Passwords?

```javascript
// ❌ NEVER DO THIS - Storing plain text passwords
const user = {
  email: "john@example.com",
  password: "mypassword123", // DANGEROUS!
};

// ✅ ALWAYS DO THIS - Hash passwords
const user = {
  email: "john@example.com",
  password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
};
```

### bcrypt - Password Hashing

```bash
npm install bcryptjs
```

#### How bcrypt Works

```javascript
import bcrypt from "bcryptjs";

// Hashing process
const password = "mypassword123";

// 1. Generate salt (random data)
const salt = await bcrypt.genSalt(10); // 10 rounds
// Salt: $2b$10$N9qo8uLOickgx2ZMRZoMye

// 2. Hash password with salt
const hash = await bcrypt.hash(password, salt);
// Hash: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

// Or combine both steps
const hash = await bcrypt.hash(password, 10);
```

#### Understanding Salt Rounds

```javascript
// Salt rounds = 2^n iterations
// More rounds = more secure but slower

const rounds = 10; // 2^10 = 1,024 iterations (~100ms)
const rounds = 12; // 2^12 = 4,096 iterations (~300ms)
const rounds = 14; // 2^14 = 16,384 iterations (~1000ms)

// Recommended: 10-12 rounds
```

#### Password Hashing in User Model

```javascript
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false, // Don't include in queries by default
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
```

#### Registration & Login

```javascript
// Registration
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Create user (password will be hashed automatically)
    const user = await User.create({ email, password });

    res.status(201).json({
      message: "User created successfully",
      user: { email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user (include password field)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: { email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

## JWT (JSON Web Tokens)

### What is JWT?

A JWT is a compact, URL-safe token that contains claims (user data) and is digitally signed.

### JWT Structure

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWY4YzNhMjRiOGE3ZDAwMWU4YjQ1NjciLCJpYXQiOjE3MTA4NTY2MTAsImV4cCI6MTcxMDg2MDIxMH0.4X8kN9qZ5YvK3mJ2nL1pR6tS8wU0vB7cD9eF1gH2iJ3

│                    │                                                                                                    │                                │
│      HEADER        │                                    PAYLOAD                                                         │           SIGNATURE            │
```

#### 1. Header

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### 2. Payload (Claims)

```json
{
  "_id": "65f8c3a24b8a7d001e8b4567",
  "email": "john@example.com",
  "role": "user",
  "iat": 1710856610, // Issued at
  "exp": 1710860210 // Expiration
}
```

#### 3. Signature

```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### Installing jsonwebtoken

```bash
npm install jsonwebtoken
```

### Generating JWT

```javascript
import jwt from "jsonwebtoken";

// Generate token
function generateToken(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    role: user.role,
  };

  const secret = process.env.JWT_SECRET;
  const options = {
    expiresIn: "1h", // Token expires in 1 hour
  };

  return jwt.sign(payload, secret, options);
}

// Usage
const token = generateToken(user);
```

### Expiration Options

```javascript
// Seconds
jwt.sign(payload, secret, { expiresIn: 3600 });

// String format
jwt.sign(payload, secret, { expiresIn: "1h" });
jwt.sign(payload, secret, { expiresIn: "7d" });
jwt.sign(payload, secret, { expiresIn: "30m" });
jwt.sign(payload, secret, { expiresIn: "1y" });
```

### Verifying JWT

```javascript
// Verify token
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Token expired");
    } else if (err.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw err;
  }
}

// Usage
try {
  const decoded = verifyToken(token);
  console.log(decoded);
  // { _id: '...', email: '...', iat: ..., exp: ... }
} catch (err) {
  console.error(err.message);
}
```

### Authentication Middleware

```javascript
function authenticate(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
      });
    }
    return res.status(401).json({
      error: "Invalid token",
    });
  }
}

// Use in routes
app.get("/profile", authenticate, (req, res) => {
  res.json({ user: req.user });
});
```

### Refresh Tokens

```javascript
// Generate both access and refresh tokens
function generateTokens(user) {
  const accessToken = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }, // Short-lived
  );

  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }, // Long-lived
  );

  return { accessToken, refreshToken };
}

// Refresh endpoint
app.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});
```

### JWT vs Sessions

| Feature         | JWT                    | Sessions                   |
| --------------- | ---------------------- | -------------------------- |
| **Storage**     | Client-side            | Server-side                |
| **Scalability** | ✅ Stateless           | ❌ Requires shared storage |
| **Size**        | Larger (contains data) | Smaller (just ID)          |
| **Revocation**  | ❌ Difficult           | ✅ Easy                    |
| **Performance** | ✅ No DB lookup        | ❌ DB lookup required      |
| **Security**    | Must be protected      | More secure                |

---

## Session-Based Authentication

### How Sessions Work

```
1. User logs in
2. Server creates session and stores in database/memory
3. Server sends session ID to client (cookie)
4. Client sends session ID with each request
5. Server validates session ID
```

### Implementation

```bash
npm install express-session connect-mongo
```

```javascript
import session from "express-session";
import MongoStore from "connect-mongo";

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      ttl: 24 * 60 * 60, // 1 day
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true, // Prevent XSS
      secure: process.env.NODE_ENV === "production", // HTTPS only
      sameSite: "strict", // CSRF protection
    },
  }),
);

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Create session
  req.session.userId = user._id;
  req.session.email = user.email;

  res.json({ message: "Login successful" });
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful" });
  });
});

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// Protected route
app.get("/profile", requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.json({ user });
});
```

---

## OAuth 2.0

### What is OAuth?

OAuth 2.0 is an authorization framework that allows third-party applications to access user data without exposing passwords.

### OAuth Flow (Authorization Code)

```
1. User clicks "Login with Google"
2. Redirect to Google's authorization page
3. User grants permission
4. Google redirects back with authorization code
5. Exchange code for access token
6. Use access token to get user data
```

### Implementation with Passport.js

```bash
npm install passport passport-google-oauth20
```

```javascript
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// Configure Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          });
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard");
  },
);
```

---

## Security Best Practices

### 1. Environment Variables

```javascript
// .env
JWT_SECRET=your_super_secret_key_here_make_it_long_and_random
JWT_REFRESH_SECRET=another_super_secret_key
SESSION_SECRET=session_secret_key
MONGO_URL=mongodb://localhost:27017/mydb

// Never commit .env to version control!
// Add to .gitignore
```

### 2. HTTPS Only

```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 3. Helmet - Security Headers

```bash
npm install helmet
```

```javascript
import helmet from "helmet";

app.use(helmet());

// Helmet sets these headers:
// - X-DNS-Prefetch-Control
// - X-Frame-Options
// - X-Content-Type-Options
// - X-XSS-Protection
// - Strict-Transport-Security
// - Content-Security-Policy
```

### 4. CORS Configuration

```bash
npm install cors
```

```javascript
import cors from "cors";

// Allow specific origins
app.use(
  cors({
    origin: ["https://myapp.com", "https://www.myapp.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

### 5. Input Validation

```bash
npm install express-validator
```

```javascript
import { body, validationResult } from "express-validator";

app.post(
  "/register",
  // Validation rules
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("name").trim().notEmpty(),

  // Handle validation
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Process registration
  },
);
```

### 6. SQL Injection Prevention

```javascript
// ✅ Mongoose automatically escapes queries
const user = await User.findOne({ email: req.body.email });

// ❌ Never use string concatenation
const query = `SELECT * FROM users WHERE email = '${req.body.email}'`;
```

### 7. XSS Prevention

```bash
npm install xss-clean
```

```javascript
import xss from "xss-clean";

app.use(xss());
```

### 8. Password Policies

```javascript
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  if (password.length < minLength) {
    return "Password must be at least 8 characters";
  }
  if (!hasUpperCase) {
    return "Password must contain uppercase letter";
  }
  if (!hasLowerCase) {
    return "Password must contain lowercase letter";
  }
  if (!hasNumbers) {
    return "Password must contain number";
  }
  if (!hasSpecialChar) {
    return "Password must contain special character";
  }

  return null;
}
```

---

## Common Vulnerabilities

### 1. SQL Injection

**Prevention**: Use parameterized queries (Mongoose does this automatically)

### 2. XSS (Cross-Site Scripting)

**Prevention**: Sanitize user input, use Content Security Policy

```javascript
import xss from "xss-clean";
app.use(xss());
```

### 3. CSRF (Cross-Site Request Forgery)

**Prevention**: Use CSRF tokens

```bash
npm install csurf
```

```javascript
import csrf from "csurf";

const csrfProtection = csrf({ cookie: true });

app.get("/form", csrfProtection, (req, res) => {
  res.render("form", { csrfToken: req.csrfToken() });
});

app.post("/submit", csrfProtection, (req, res) => {
  // Process form
});
```

### 4. Brute Force Attacks

**Prevention**: Rate limiting (see next section)

### 5. JWT Token Theft

**Prevention**:

- Use HTTPS
- Set short expiration times
- Store tokens securely (httpOnly cookies)
- Implement token blacklisting

---

## Rate Limiting

### express-rate-limit

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from "express-rate-limit";

// General rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later",
});

app.use("/api/", limiter);

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 attempts
  skipSuccessfulRequests: true,
});

app.post("/login", authLimiter, loginHandler);
app.post("/register", authLimiter, registerHandler);
```

### Custom Rate Limiter

```javascript
const loginAttempts = new Map();

function rateLimitLogin(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    return next();
  }

  const attempts = loginAttempts.get(ip);

  if (now > attempts.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    return next();
  }

  if (attempts.count >= 5) {
    return res.status(429).json({
      error: "Too many login attempts. Try again in 15 minutes.",
    });
  }

  attempts.count++;
  next();
}

app.post("/login", rateLimitLogin, loginHandler);
```

---

## Complete Authentication System

```javascript
// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
```

```javascript
// middleware/auth.js
import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
```

```javascript
// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.create({ email, password });
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

---

## Summary

### Key Takeaways:

1. ✅ Always hash passwords with bcrypt
2. ✅ Use JWT for stateless authentication
3. ✅ Implement proper authorization
4. ✅ Use HTTPS in production
5. ✅ Set security headers with Helmet
6. ✅ Implement rate limiting
7. ✅ Validate and sanitize input
8. ✅ Use environment variables for secrets
9. ✅ Implement refresh tokens
10. ✅ Follow security best practices

Security is not optional - it's essential!

# Role Based Access Control (RBAC) System

This section of the documentation details the implementation of Role Based Access Control (RBAC) in the application. RBAC provides a secure and flexible way to manage user permissions by assigning roles to users and permissions to those roles.

## 1. Overview

Instead of simple checks (e.g., `isAdmin = true`), this system uses a more granular approach:

1. **Roles**: Users are assigned a role (e.g., "Admin", "User", "Manager").
2. **Permissions**: Roles are assigned specific permissions (e.g., "DELETE", "UPDATE", "READ_ALL").
3. **Middleware**: We use dedicated middleware checks to enforce these rules on specific routes.

## 2. Data Models

### Role Model

The `Role` model defines what permissions are available for a given role name.

**File:** `models/role.models.js`

```javascript
import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: String, // e.g., "Admin", "User"
  permissions: [String], // e.g., ["DELETE", "UPDATE_USER", "VIEW_REPORTS"]
});

const roleModel = mongoose.model("Role", roleSchema);
export default roleModel;
```

### User Model Integration

The `User` model acts as the link to the RBAC system via a `role` field.

- **Field**: `role` (String)
- **Relationship**: Should match a `name` in the `Role` collection.

## 3. Middleware Implementation

We have implemented two specific middleware functions to handle authorization checks. Note that these should generally follow authentication middleware (checking if the user is logged in).

### A. Role Verification (`authRole`)

This middleware restricts access to users who hold a specific role.

**File:** `middleware/authRole.js`

```javascript
export const authRole = (role) => {
  try {
    return async (req, res, next) => {
      // 1. Fetch user to confirm their current role
      const user = await userModel.findById(req.user._id);
      const userRole = user.role;

      // 2. Compare user's role with the required role
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
```

### B. Permission Verification (`authPremiss`)

This middleware checks if the user's role allows a specific action (permission), offering finer granularity than simple role checks.

**File:** `middleware/authPremiss.js`

```javascript
export const authPremiss = (permission) => {
  return async (req, res, next) => {
    // 1. Get the user to find their role
    const user = await userModel.findById(req.user._id);

    // 2. Find the Role document that matches the user's role string
    await roleModel
      .findOne({ name: user.role })
      .then((role) => {
        // 3. Check if the role's permissions array includes the required permission
        if (role.permissions.includes(permission)) {
          next();
        } else {
          res.status(401).json({ message: "No Permission for this role" });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
      });
  };
};
```

## 4. Usage in Routes

You can chain these middleware functions in your route definitions to enforce security policies.

**Example Flow:**

1. `authorization`: Verifies the JWT/session (Is the user logged in?).
2. `authRole`: Verifies the user has a specific role (optional, if you want only Admins).
3. `authPremiss`: Verifies the user has permission to perform the specific action (e.g., DELETE).

**File:** `routers/user.routes.js`

```javascript
import { authRole } from "../middleware/authRole.js";
import { authPremiss } from "../middleware/authPremiss.js";
// ... other imports

// Example: Delete user route
// Requirements: Logged in, must have "User" role, must have "DELETE" permission
router.delete(
  "/:id",
  authorization, // 1. Authentication
  authRole("User"), // 2. Role Check
  authPremiss("DELETE"), // 3. Permission Check
  userController.deleteUser,
);
```

## 5. Setup Checklist

To make this system work effectively:

1.  **Seed Roles**: Ensure your database has `Role` documents created (e.g., a Role with name "User" and permissions `["DELETE", "READ"]`).
2.  **Assign Roles**: When creating users, ensure they are assigned a valid role string (e.g., `user.role = "User"`).
3.  **Hierarchy**: You can choose to use strictly `authPremiss` for feature flags or `authRole` for section access (like an Admin Dashboard).

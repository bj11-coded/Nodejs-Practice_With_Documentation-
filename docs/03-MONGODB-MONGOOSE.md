# MongoDB & Mongoose Deep Dive

## Table of Contents

1. [MongoDB Fundamentals](#mongodb-fundamentals)
2. [Mongoose ODM](#mongoose-odm)
3. [Schemas & Models](#schemas--models)
4. [CRUD Operations](#crud-operations)
5. [Query Methods](#query-methods)
6. [Relationships](#relationships)
7. [Validation](#validation)
8. [Middleware (Hooks)](#middleware-hooks)
9. [Aggregation](#aggregation)
10. [Best Practices](#best-practices)

---

## MongoDB Fundamentals

### What is MongoDB?

**MongoDB** is a NoSQL, document-oriented database that stores data in flexible, JSON-like documents.

### Key Concepts

#### 1. **Document**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "New York"
  },
  "hobbies": ["reading", "coding"]
}
```

#### 2. **Collection**

A group of documents (similar to a table in SQL)

#### 3. **Database**

A container for collections

### SQL vs MongoDB

| SQL         | MongoDB               |
| ----------- | --------------------- |
| Database    | Database              |
| Table       | Collection            |
| Row         | Document              |
| Column      | Field                 |
| JOIN        | Embedding/Referencing |
| Primary Key | \_id (auto-generated) |

### MongoDB Data Types

```javascript
{
  string: "Hello",
  number: 42,
  boolean: true,
  date: new Date(),
  array: [1, 2, 3],
  object: { nested: "value" },
  null: null,
  objectId: ObjectId("507f1f77bcf86cd799439011"),
  binary: BinData(0, "..."),
  regex: /pattern/i
}
```

---

## Mongoose ODM

### What is Mongoose?

**Mongoose** is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides:

- Schema validation
- Type casting
- Query building
- Business logic hooks
- Relationship management

### Installation

```bash
npm install mongoose
```

### Connecting to MongoDB

```javascript
import mongoose from "mongoose";

// Connection string format
const MONGO_URL = "mongodb://localhost:27017/mydb";
// OR MongoDB Atlas
const MONGO_URL = "mongodb+srv://username:password@cluster.mongodb.net/mydb";

// Connect
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

connectDB();
```

### Connection Events

```javascript
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
```

---

## Schemas & Models

### Creating a Schema

```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // String
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    // String with validation
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    // Number
    age: {
      type: Number,
      min: 0,
      max: 120,
      default: 18,
    },

    // Boolean
    isActive: {
      type: Boolean,
      default: true,
    },

    // Date
    birthDate: {
      type: Date,
      required: true,
    },

    // Array of strings
    hobbies: [String],

    // Array of objects
    addresses: [
      {
        street: String,
        city: String,
        zipCode: String,
      },
    ],

    // Enum
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },

    // Nested object
    profile: {
      bio: String,
      website: String,
      avatar: String,
    },

    // Reference to another model
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: "users", // Custom collection name
  },
);

// Create model
const User = mongoose.model("User", userSchema);

export default User;
```

### Schema Types

```javascript
const schema = new mongoose.Schema({
  // Basic types
  string: String,
  number: Number,
  boolean: Boolean,
  date: Date,
  buffer: Buffer,
  objectId: mongoose.Schema.Types.ObjectId,
  array: Array,
  mixed: mongoose.Schema.Types.Mixed,

  // Decimal (for precise numbers like money)
  price: mongoose.Schema.Types.Decimal128,

  // Map
  metadata: {
    type: Map,
    of: String,
  },
});
```

### Schema Options

```javascript
const schema = new mongoose.Schema(
  {
    name: String,
  },
  {
    // Timestamps
    timestamps: true,

    // Custom collection name
    collection: "my_collection",

    // Disable _id
    _id: false,

    // Disable version key (__v)
    versionKey: false,

    // Strict mode (reject fields not in schema)
    strict: true,

    // Auto-create collection
    autoCreate: true,

    // Minimize empty objects
    minimize: false,
  },
);
```

---

## CRUD Operations

### Create

```javascript
// Method 1: Using constructor
const user = new User({
  name: "John Doe",
  email: "john@example.com",
  age: 30,
});
await user.save();

// Method 2: Using create()
const user = await User.create({
  name: "John Doe",
  email: "john@example.com",
  age: 30,
});

// Method 3: Insert many
const users = await User.insertMany([
  { name: "John", email: "john@example.com" },
  { name: "Jane", email: "jane@example.com" },
]);
```

### Read

```javascript
// Find all
const users = await User.find();

// Find with conditions
const users = await User.find({ age: { $gte: 18 } });

// Find one
const user = await User.findOne({ email: "john@example.com" });

// Find by ID
const user = await User.findById("507f1f77bcf86cd799439011");

// Find with specific fields
const users = await User.find().select("name email -_id");

// Find with limit and skip (pagination)
const users = await User.find().limit(10).skip(20).sort({ createdAt: -1 });

// Count documents
const count = await User.countDocuments({ age: { $gte: 18 } });

// Check if exists
const exists = await User.exists({ email: "john@example.com" });
```

### Update

```javascript
// Update one
const result = await User.updateOne(
  { email: "john@example.com" },
  { $set: { age: 31 } },
);

// Update many
const result = await User.updateMany(
  { age: { $lt: 18 } },
  { $set: { isActive: false } },
);

// Find and update
const user = await User.findOneAndUpdate(
  { email: "john@example.com" },
  { $set: { age: 31 } },
  { new: true, runValidators: true },
);

// Find by ID and update
const user = await User.findByIdAndUpdate(
  "507f1f77bcf86cd799439011",
  { $set: { age: 31 } },
  { new: true, runValidators: true },
);

// Update using document
const user = await User.findById("507f1f77bcf86cd799439011");
user.age = 31;
await user.save();
```

### Delete

```javascript
// Delete one
const result = await User.deleteOne({ email: "john@example.com" });

// Delete many
const result = await User.deleteMany({ isActive: false });

// Find and delete
const user = await User.findOneAndDelete({ email: "john@example.com" });

// Find by ID and delete
const user = await User.findByIdAndDelete("507f1f77bcf86cd799439011");

// Remove using document
const user = await User.findById("507f1f77bcf86cd799439011");
await user.remove();
```

---

## Query Methods

### Comparison Operators

```javascript
// Equal
User.find({ age: 30 });

// Not equal
User.find({ age: { $ne: 30 } });

// Greater than
User.find({ age: { $gt: 18 } });

// Greater than or equal
User.find({ age: { $gte: 18 } });

// Less than
User.find({ age: { $lt: 65 } });

// Less than or equal
User.find({ age: { $lte: 65 } });

// In array
User.find({ role: { $in: ["admin", "moderator"] } });

// Not in array
User.find({ role: { $nin: ["banned", "suspended"] } });
```

### Logical Operators

```javascript
// AND
User.find({
  age: { $gte: 18 },
  isActive: true,
});

// OR
User.find({
  $or: [{ age: { $lt: 18 } }, { age: { $gt: 65 } }],
});

// NOT
User.find({
  age: { $not: { $gte: 18 } },
});

// NOR
User.find({
  $nor: [{ age: { $lt: 18 } }, { isActive: false }],
});
```

### Element Operators

```javascript
// Exists
User.find({ phone: { $exists: true } });

// Type
User.find({ age: { $type: "number" } });
```

### Array Operators

```javascript
// All elements match
User.find({ hobbies: { $all: ["reading", "coding"] } });

// Array size
User.find({ hobbies: { $size: 3 } });

// Element match
User.find({
  addresses: {
    $elemMatch: { city: "New York", zipCode: "10001" },
  },
});
```

### String Operators

```javascript
// Regex
User.find({ name: /john/i });
User.find({ name: { $regex: "john", $options: "i" } });

// Text search (requires text index)
User.find({ $text: { $search: "john doe" } });
```

### Query Chaining

```javascript
const users = await User.find({ age: { $gte: 18 } })
  .where("isActive")
  .equals(true)
  .where("role")
  .in(["user", "admin"])
  .select("name email")
  .sort({ createdAt: -1 })
  .limit(10)
  .skip(20)
  .exec();
```

### Populate (Join)

```javascript
// Basic populate
const posts = await Post.find().populate("author");

// Populate specific fields
const posts = await Post.find().populate("author", "name email");

// Nested populate
const posts = await Post.find().populate({
  path: "author",
  select: "name email",
  populate: {
    path: "company",
    select: "name",
  },
});

// Multiple populates
const posts = await Post.find().populate("author").populate("comments");
```

---

## Relationships

### One-to-One

```javascript
// User has one profile
const userSchema = new mongoose.Schema({
  name: String,
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
});

const profileSchema = new mongoose.Schema({
  bio: String,
  avatar: String,
});

const User = mongoose.model("User", userSchema);
const Profile = mongoose.model("Profile", profileSchema);

// Create
const profile = await Profile.create({ bio: "Developer" });
const user = await User.create({ name: "John", profile: profile._id });

// Query
const user = await User.findById(userId).populate("profile");
```

### One-to-Many (Referencing)

```javascript
// User has many posts
const userSchema = new mongoose.Schema({
  name: String,
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

// Create
const user = await User.create({ name: "John" });
const post = await Post.create({
  title: "My Post",
  content: "Content",
  author: user._id,
});

// Query
const posts = await Post.find().populate("author");
const userPosts = await Post.find({ author: userId });
```

### One-to-Many (Embedding)

```javascript
const userSchema = new mongoose.Schema({
  name: String,
  addresses: [
    {
      street: String,
      city: String,
      zipCode: String,
    },
  ],
});

const User = mongoose.model("User", userSchema);

// Create
const user = await User.create({
  name: "John",
  addresses: [
    { street: "123 Main St", city: "New York", zipCode: "10001" },
    { street: "456 Oak Ave", city: "Boston", zipCode: "02101" },
  ],
});

// Add address
user.addresses.push({
  street: "789 Elm St",
  city: "Chicago",
  zipCode: "60601",
});
await user.save();
```

### Many-to-Many

```javascript
const studentSchema = new mongoose.Schema({
  name: String,
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

const courseSchema = new mongoose.Schema({
  name: String,
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
});

const Student = mongoose.model("Student", studentSchema);
const Course = mongoose.model("Course", courseSchema);

// Enroll student in course
const student = await Student.findById(studentId);
const course = await Course.findById(courseId);

student.courses.push(course._id);
course.students.push(student._id);

await student.save();
await course.save();

// Query
const student = await Student.findById(studentId).populate("courses");
```

---

## Validation

### Built-in Validators

```javascript
const userSchema = new mongoose.Schema({
  // Required
  name: {
    type: String,
    required: true,
  },

  // Custom error message
  email: {
    type: String,
    required: [true, "Email is required"],
  },

  // String validators
  username: {
    type: String,
    minlength: 3,
    maxlength: 20,
    trim: true,
    lowercase: true,
    uppercase: false,
  },

  // Number validators
  age: {
    type: Number,
    min: 0,
    max: 120,
  },

  // Enum
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  // Match (regex)
  phone: {
    type: String,
    match: /^\d{10}$/,
  },
});
```

### Custom Validators

```javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    validate: {
      validator: function (v) {
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },

  password: {
    type: String,
    validate: {
      validator: function (v) {
        return v.length >= 8;
      },
      message: "Password must be at least 8 characters",
    },
  },

  // Async validator
  username: {
    type: String,
    validate: {
      validator: async function (v) {
        const count = await mongoose.models.User.countDocuments({
          username: v,
          _id: { $ne: this._id },
        });
        return count === 0;
      },
      message: "Username already exists",
    },
  },
});
```

### Schema-Level Validation

```javascript
userSchema.path("email").validate(async function (value) {
  const count = await mongoose.models.User.countDocuments({
    email: value,
    _id: { $ne: this._id },
  });
  return count === 0;
}, "Email already exists");
```

---

## Middleware (Hooks)

### Pre Hooks

```javascript
// Before save
userSchema.pre("save", async function (next) {
  // Hash password before saving
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Before validate
userSchema.pre("validate", function (next) {
  console.log("Validating...");
  next();
});

// Before remove
userSchema.pre("remove", async function (next) {
  // Delete user's posts when user is deleted
  await Post.deleteMany({ author: this._id });
  next();
});

// Before find
userSchema.pre("find", function (next) {
  this.populate("profile");
  next();
});
```

### Post Hooks

```javascript
// After save
userSchema.post("save", function (doc, next) {
  console.log("User saved:", doc._id);
  next();
});

// After remove
userSchema.post("remove", function (doc, next) {
  console.log("User removed:", doc._id);
  next();
});

// Error handling
userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("Duplicate key error"));
  } else {
    next(error);
  }
});
```

### Virtual Properties

```javascript
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual("fullName").set(function (v) {
  const parts = v.split(" ");
  this.firstName = parts[0];
  this.lastName = parts[1];
});

// Include virtuals in JSON
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

// Usage
const user = new User({ firstName: "John", lastName: "Doe" });
console.log(user.fullName); // John Doe

user.fullName = "Jane Smith";
console.log(user.firstName); // Jane
console.log(user.lastName); // Smith
```

### Instance Methods

```javascript
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
};

// Usage
const user = await User.findOne({ email: "john@example.com" });
const isMatch = await user.comparePassword("password123");
const token = user.generateAuthToken();
```

### Static Methods

```javascript
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

userSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Usage
const user = await User.findByEmail("john@example.com");
const activeUsers = await User.findActive();
```

---

## Aggregation

### Basic Aggregation

```javascript
// Count by role
const result = await User.aggregate([
  {
    $group: {
      _id: "$role",
      count: { $sum: 1 },
    },
  },
]);

// Average age
const result = await User.aggregate([
  {
    $group: {
      _id: null,
      avgAge: { $avg: "$age" },
    },
  },
]);
```

### Aggregation Pipeline

```javascript
const result = await User.aggregate([
  // Stage 1: Match (filter)
  {
    $match: {
      isActive: true,
      age: { $gte: 18 },
    },
  },

  // Stage 2: Group
  {
    $group: {
      _id: "$role",
      count: { $sum: 1 },
      avgAge: { $avg: "$age" },
      users: { $push: "$name" },
    },
  },

  // Stage 3: Sort
  {
    $sort: { count: -1 },
  },

  // Stage 4: Limit
  {
    $limit: 10,
  },

  // Stage 5: Project (select fields)
  {
    $project: {
      role: "$_id",
      count: 1,
      avgAge: 1,
      _id: 0,
    },
  },
]);
```

### Lookup (Join)

```javascript
const result = await Post.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "author",
      foreignField: "_id",
      as: "authorDetails",
    },
  },
  {
    $unwind: "$authorDetails",
  },
  {
    $project: {
      title: 1,
      content: 1,
      "authorDetails.name": 1,
      "authorDetails.email": 1,
    },
  },
]);
```

---

## Best Practices

### 1. Use Lean Queries for Read-Only Operations

```javascript
// Regular query (returns Mongoose document)
const user = await User.findById(id);

// Lean query (returns plain JavaScript object)
const user = await User.findById(id).lean();
```

### 2. Use Indexes

```javascript
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ name: 1, age: -1 });
userSchema.index({ location: "2dsphere" }); // Geospatial
```

### 3. Use Select to Limit Fields

```javascript
// Only get needed fields
const users = await User.find().select("name email");
```

### 4. Use Pagination

```javascript
async function getUsers(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const users = await User.find()
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments();

  return {
    users,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  };
}
```

### 5. Handle Errors Properly

```javascript
try {
  const user = await User.create(userData);
} catch (err) {
  if (err.code === 11000) {
    // Duplicate key error
    console.error("Email already exists");
  } else if (err.name === "ValidationError") {
    // Validation error
    console.error(err.errors);
  } else {
    console.error(err);
  }
}
```

### 6. Use Transactions for Multiple Operations

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  const user = await User.create([userData], { session });
  const profile = await Profile.create([{ user: user[0]._id }], { session });

  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```

---

## Summary

MongoDB with Mongoose provides:

- ✅ Flexible document-based storage
- ✅ Schema validation
- ✅ Powerful query capabilities
- ✅ Relationship management
- ✅ Middleware hooks
- ✅ Aggregation framework

Master these concepts to build robust database-driven applications!

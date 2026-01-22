# Node.js Fundamentals - Deep Dive

## Table of Contents

1. [What is Node.js?](#what-is-nodejs)
2. [The Event Loop](#the-event-loop)
3. [Modules System](#modules-system)
4. [Asynchronous Programming](#asynchronous-programming)
5. [NPM & Package Management](#npm--package-management)
6. [File System Operations](#file-system-operations)

---

## What is Node.js?

### Definition

**Node.js** is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows you to run JavaScript on the server-side, outside of a browser.

### Key Characteristics

#### 1. **Single-Threaded**

```javascript
// Node.js uses a single thread for JavaScript execution
console.log("Start");
setTimeout(() => console.log("Timeout"), 0);
console.log("End");

// Output:
// Start
// End
// Timeout
```

**Why Single-Threaded?**

- Simplifies programming model
- Avoids thread synchronization issues
- Uses event loop for concurrency

#### 2. **Non-Blocking I/O**

```javascript
// Blocking (Synchronous) - BAD
const fs = require("fs");
const data = fs.readFileSync("file.txt"); // Blocks execution
console.log(data);
console.log("After read");

// Non-Blocking (Asynchronous) - GOOD
fs.readFile("file.txt", (err, data) => {
  if (err) throw err;
  console.log(data);
});
console.log("After read"); // Executes immediately
```

#### 3. **Event-Driven Architecture**

```javascript
const EventEmitter = require("events");

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

// Register event listener
myEmitter.on("event", (data) => {
  console.log("Event occurred:", data);
});

// Emit event
myEmitter.emit("event", { message: "Hello!" });
```

### Node.js vs Browser JavaScript

| Feature           | Node.js      | Browser  |
| ----------------- | ------------ | -------- |
| **Global Object** | `global`     | `window` |
| **Modules**       | CommonJS/ES6 | ES6 only |
| **File System**   | ✅ Yes       | ❌ No    |
| **DOM**           | ❌ No        | ✅ Yes   |
| **HTTP Server**   | ✅ Yes       | ❌ No    |
| **Environment**   | Server       | Client   |

---

## The Event Loop

### What is the Event Loop?

The **Event Loop** is the mechanism that allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded.

### Event Loop Phases

```
   ┌───────────────────────────┐
┌─>│           timers          │  setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  I/O callbacks deferred
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  Internal use
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  Retrieve new I/O events
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  socket.on('close', ...)
   └───────────────────────────┘
```

### Detailed Example

```javascript
console.log("1: Start");

setTimeout(() => {
  console.log("2: setTimeout");
}, 0);

setImmediate(() => {
  console.log("3: setImmediate");
});

process.nextTick(() => {
  console.log("4: nextTick");
});

Promise.resolve().then(() => {
  console.log("5: Promise");
});

console.log("6: End");

// Output:
// 1: Start
// 6: End
// 4: nextTick
// 5: Promise
// 2: setTimeout
// 3: setImmediate
```

### Execution Order Explained

1. **Synchronous Code**: Executes first (1, 6)
2. **process.nextTick()**: Executes after current operation (4)
3. **Microtasks (Promises)**: Execute after nextTick (5)
4. **Timers**: setTimeout callbacks (2)
5. **Check**: setImmediate callbacks (3)

### Call Stack, Callback Queue, and Event Loop

```javascript
// Example demonstrating the flow
function first() {
  console.log("First function");
  second();
}

function second() {
  console.log("Second function");
  setTimeout(() => {
    console.log("Timeout callback");
  }, 0);
  console.log("Second function end");
}

first();
console.log("Global end");

/*
Call Stack Flow:
1. first() pushed
2. console.log('First function')
3. second() pushed
4. console.log('Second function')
5. setTimeout registered (callback goes to Web APIs)
6. console.log('Second function end')
7. second() popped
8. first() popped
9. console.log('Global end')
10. Event loop checks callback queue
11. Timeout callback executed

Output:
First function
Second function
Second function end
Global end
Timeout callback
*/
```

---

## Modules System

### CommonJS vs ES6 Modules

#### CommonJS (Traditional Node.js)

```javascript
// math.js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

// Export
module.exports = { add, subtract };
// OR
exports.add = add;
exports.subtract = subtract;

// app.js
const math = require("./math");
console.log(math.add(5, 3)); // 8
```

**How it works:**

- `module.exports` is an object
- `exports` is a reference to `module.exports`
- `require()` caches modules (singleton pattern)

#### ES6 Modules (Modern)

```javascript
// math.js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// OR default export
export default {
  add,
  subtract,
};

// app.js
import { add, subtract } from "./math.js";
// OR
import math from "./math.js";

console.log(add(5, 3)); // 8
```

**Enable ES6 Modules:**

```json
// package.json
{
  "type": "module"
}
```

### Module Caching

```javascript
// counter.js
let count = 0;

module.exports = {
  increment() {
    count++;
  },
  getCount() {
    return count;
  },
};

// app.js
const counter1 = require("./counter");
const counter2 = require("./counter");

counter1.increment();
console.log(counter1.getCount()); // 1
console.log(counter2.getCount()); // 1 (same instance!)
```

### Core Modules

Node.js comes with built-in modules:

```javascript
// File System
const fs = require("fs");

// Path manipulation
const path = require("path");

// HTTP server
const http = require("http");

// Operating System
const os = require("os");

// Events
const events = require("events");

// Crypto
const crypto = require("crypto");

// URL parsing
const url = require("url");

// Query string
const querystring = require("querystring");
```

---

## Asynchronous Programming

### 1. Callbacks

```javascript
// Callback pattern
function fetchUser(id, callback) {
  setTimeout(() => {
    const user = { id, name: "John" };
    callback(null, user); // (error, result)
  }, 1000);
}

fetchUser(1, (err, user) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(user);
});
```

**Callback Hell (Pyramid of Doom):**

```javascript
// BAD - Nested callbacks
getUser(1, (err, user) => {
  if (err) return console.error(err);

  getPosts(user.id, (err, posts) => {
    if (err) return console.error(err);

    getComments(posts[0].id, (err, comments) => {
      if (err) return console.error(err);

      console.log(comments);
    });
  });
});
```

### 2. Promises

```javascript
// Promise-based approach
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = { id, name: "John" };
      resolve(user);
      // reject(new Error('User not found'));
    }, 1000);
  });
}

// Using promises
fetchUser(1)
  .then((user) => {
    console.log(user);
    return fetchPosts(user.id);
  })
  .then((posts) => {
    console.log(posts);
    return fetchComments(posts[0].id);
  })
  .then((comments) => {
    console.log(comments);
  })
  .catch((err) => {
    console.error(err);
  });
```

**Promise States:**

- **Pending**: Initial state
- **Fulfilled**: Operation completed successfully
- **Rejected**: Operation failed

**Promise Methods:**

```javascript
// Promise.all - Wait for all
Promise.all([promise1, promise2, promise3]).then((results) => {
  console.log(results); // Array of results
});

// Promise.race - First to complete
Promise.race([promise1, promise2]).then((result) => {
  console.log(result); // First result
});

// Promise.allSettled - Wait for all (even if rejected)
Promise.allSettled([promise1, promise2]).then((results) => {
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      console.log(result.value);
    } else {
      console.log(result.reason);
    }
  });
});
```

### 3. Async/Await

```javascript
// Modern approach - async/await
async function getUserData(id) {
  try {
    const user = await fetchUser(id);
    console.log(user);

    const posts = await fetchPosts(user.id);
    console.log(posts);

    const comments = await fetchComments(posts[0].id);
    console.log(comments);

    return comments;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

// Call async function
getUserData(1);
```

**Parallel Execution:**

```javascript
// Sequential (slow)
async function sequential() {
  const user1 = await fetchUser(1); // Wait 1s
  const user2 = await fetchUser(2); // Wait 1s
  // Total: 2s
}

// Parallel (fast)
async function parallel() {
  const [user1, user2] = await Promise.all([fetchUser(1), fetchUser(2)]);
  // Total: 1s
}
```

### Error Handling Patterns

```javascript
// 1. Callback error-first pattern
function readFile(path, callback) {
  fs.readFile(path, (err, data) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);
  });
}

// 2. Promise error handling
fetchUser(1)
  .then((user) => processUser(user))
  .catch((err) => console.error(err))
  .finally(() => console.log("Cleanup"));

// 3. Async/await error handling
async function getData() {
  try {
    const data = await fetchData();
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    console.log("Cleanup");
  }
}
```

---

## NPM & Package Management

### What is NPM?

**NPM** (Node Package Manager) is the default package manager for Node.js.

### package.json

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "My application",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "keywords": ["api", "rest"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^5.2.1",
    "mongoose": "^9.1.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.11",
    "jest": "^29.0.0"
  }
}
```

### Semantic Versioning (SemVer)

```
^5.2.1
│ │ │
│ │ └─ Patch version (bug fixes)
│ └─── Minor version (new features, backward compatible)
└───── Major version (breaking changes)
```

**Version Symbols:**

- `^5.2.1`: Compatible with 5.x.x (>=5.2.1 <6.0.0)
- `~5.2.1`: Compatible with 5.2.x (>=5.2.1 <5.3.0)
- `5.2.1`: Exact version
- `*`: Latest version

### NPM Commands

```bash
# Initialize project
npm init
npm init -y  # Skip questions

# Install packages
npm install express
npm install express@5.2.1  # Specific version
npm install --save-dev nodemon  # Dev dependency
npm install -g nodemon  # Global installation

# Uninstall
npm uninstall express

# Update packages
npm update
npm update express

# List packages
npm list
npm list --depth=0  # Top-level only

# Check outdated
npm outdated

# Run scripts
npm start
npm run dev
npm test

# View package info
npm view express
npm view express versions

# Audit security
npm audit
npm audit fix
```

### package-lock.json

**Purpose:**

- Locks exact versions of all dependencies
- Ensures consistent installations across environments
- Includes integrity hashes for security

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "node_modules/express": {
      "version": "5.2.1",
      "resolved": "https://registry.npmjs.org/express/-/express-5.2.1.tgz",
      "integrity": "sha512-...",
      "dependencies": {
        "body-parser": "1.20.2"
      }
    }
  }
}
```

### Creating Your Own Package

```javascript
// my-package/index.js
function greet(name) {
  return `Hello, ${name}!`;
}

module.exports = { greet };
```

```json
// my-package/package.json
{
  "name": "@username/my-package",
  "version": "1.0.0",
  "description": "A greeting package",
  "main": "index.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/my-package"
  }
}
```

```bash
# Publish to NPM
npm login
npm publish --access public
```

---

## File System Operations

### Reading Files

```javascript
const fs = require("fs");
const path = require("path");

// 1. Synchronous (Blocking) - Use only for initialization
try {
  const data = fs.readFileSync("file.txt", "utf8");
  console.log(data);
} catch (err) {
  console.error(err);
}

// 2. Asynchronous (Callback)
fs.readFile("file.txt", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});

// 3. Promises (Modern)
const fsPromises = require("fs").promises;

async function readFileAsync() {
  try {
    const data = await fsPromises.readFile("file.txt", "utf8");
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

### Writing Files

```javascript
// Asynchronous write
fs.writeFile("output.txt", "Hello World", (err) => {
  if (err) throw err;
  console.log("File written");
});

// Append to file
fs.appendFile("log.txt", "New log entry\n", (err) => {
  if (err) throw err;
  console.log("Data appended");
});

// Promises
await fsPromises.writeFile("output.txt", "Hello World");
```

### Working with Directories

```javascript
// Create directory
fs.mkdir("new-folder", { recursive: true }, (err) => {
  if (err) throw err;
});

// Read directory
fs.readdir("./", (err, files) => {
  if (err) throw err;
  console.log(files);
});

// Remove directory
fs.rmdir("folder", { recursive: true }, (err) => {
  if (err) throw err;
});

// Check if exists
fs.access("file.txt", fs.constants.F_OK, (err) => {
  console.log(err ? "Does not exist" : "Exists");
});
```

### File Stats

```javascript
fs.stat("file.txt", (err, stats) => {
  if (err) throw err;

  console.log("Is file:", stats.isFile());
  console.log("Is directory:", stats.isDirectory());
  console.log("Size:", stats.size, "bytes");
  console.log("Created:", stats.birthtime);
  console.log("Modified:", stats.mtime);
});
```

### Path Module

```javascript
const path = require("path");

// Join paths
const filePath = path.join(__dirname, "files", "data.txt");
// /Users/user/project/files/data.txt

// Get directory name
console.log(path.dirname(filePath));
// /Users/user/project/files

// Get file name
console.log(path.basename(filePath));
// data.txt

// Get extension
console.log(path.extname(filePath));
// .txt

// Parse path
console.log(path.parse(filePath));
/*
{
  root: '/',
  dir: '/Users/user/project/files',
  base: 'data.txt',
  ext: '.txt',
  name: 'data'
}
*/

// Resolve absolute path
console.log(path.resolve("files", "data.txt"));
// /Users/user/project/files/data.txt
```

### Streams (Efficient for Large Files)

```javascript
const fs = require("fs");

// Read stream
const readStream = fs.createReadStream("large-file.txt", "utf8");

readStream.on("data", (chunk) => {
  console.log("Chunk:", chunk);
});

readStream.on("end", () => {
  console.log("Finished reading");
});

readStream.on("error", (err) => {
  console.error(err);
});

// Write stream
const writeStream = fs.createWriteStream("output.txt");
writeStream.write("Line 1\n");
writeStream.write("Line 2\n");
writeStream.end();

// Pipe (copy file)
const source = fs.createReadStream("input.txt");
const destination = fs.createWriteStream("output.txt");
source.pipe(destination);
```

---

## Best Practices

### 1. Error Handling

```javascript
// Always handle errors
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});
```

### 2. Environment Variables

```javascript
// Use dotenv for configuration
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DATABASE_URL;
```

### 3. Avoid Blocking Operations

```javascript
// ❌ Bad - Blocks event loop
const data = fs.readFileSync("large-file.txt");

// ✅ Good - Non-blocking
fs.readFile("large-file.txt", (err, data) => {
  // Handle data
});
```

### 4. Use Async/Await

```javascript
// ✅ Modern, readable code
async function processData() {
  try {
    const data = await fetchData();
    const processed = await processData(data);
    return processed;
  } catch (err) {
    console.error(err);
  }
}
```

---

## Summary

### Key Takeaways:

1. ✅ Node.js is single-threaded but handles concurrency via event loop
2. ✅ Use ES6 modules for modern JavaScript
3. ✅ Prefer async/await over callbacks
4. ✅ Understand the event loop phases
5. ✅ Use NPM for package management
6. ✅ Handle errors properly
7. ✅ Use streams for large files
8. ✅ Never block the event loop

### Next Steps:

- Learn Express.js framework
- Understand middleware concepts
- Study database integration
- Explore authentication patterns

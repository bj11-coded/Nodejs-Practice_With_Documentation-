import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routers/user.routes.js";
import connectDB from "./database/database.js";
import postRoutes from "./routers/post.routes.js";
import fileRouter from "./routers/fileUpload.routes.js";

// swagger
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

dotenv.config();
const PORT = process.env.PORT || 4001;
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// database connection
connectDB();

// swagger implementation
const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Nodejs Practice API",
      version: "1.0.0",
      description:
        "This Backend system is created to practice Nodejs with different third party packages",
    },
    servers:[{url:"http://localhost:4000"}],
  },
  apis: ["./routers/*.routes.js"],
  
};

// routes for swagger UI
const swagger = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swagger));

// all routes here
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/file", fileRouter);

// empty routes
app.get("/", (req, res) => {
  res.send(`
        <div 
        style="height:100vh; display: flex; justify-content:center; align-items:center; font-size:120px; color: white; background-color: green;">
            Wellcome to Backend API 
        </div>
        `);
});

// url routes
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

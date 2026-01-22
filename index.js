import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routers/user.routes.js";
import connectDB from "./database/database.js";
import postRoutes from "./routers/post.routes.js";

dotenv.config();
const PORT = process.env.PORT || 4001;
const app = express();

// middleware 
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// database connection 
connectDB()

// all routes here 
app.use("/users", userRoutes)
app.use("/posts", postRoutes)

// empty routes
app.get("/",(req, res)=>{
    res.send(`
        <div 
        style="height:100vh; display: flex; justify-content:center; align-items:center; font-size:120px; color: white; background-color: green;">
            Wellcome to Backend API 
        </div>
        `)
})

// url routes 
app.listen(PORT, () =>{
    console.log(`Server is running on port http://localhost:${PORT}`);
})

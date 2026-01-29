import mongoose from "mongoose";
import roleModel from "./models/role.models.js";
import dotenv from "dotenv";
dotenv.config();

const seedRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL).then(async () => {
      await roleModel.create(
        {
          name: "Admin",
          permissions: ["CREATE", "READ", "UPDATE", "DELETE"],
        },
        {
          name: "User",
          permissions: ["READ", "UPDATE"],
        },
      );
    });
    console.log("Roles seeded successfully");
  } catch (err) {
    console.log(err.message);
  }
  
};

seedRoles();

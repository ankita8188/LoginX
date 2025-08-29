import mongoose from "mongoose";
import { config } from "dotenv";

config({ path: "./.env" });

const connection = async () => {
  try {
    await mongoose.connect(process.env.url)
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  
  }
};

export default connection;

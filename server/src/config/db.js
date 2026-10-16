import mongoose from "mongoose";
import { env } from "./env.js";

// Only fields that are in the schema are saved or queried
mongoose.set("strictQuery", true);

export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`MongoDB connected: ${conn.connection.name}`);
  } catch (err) {
    console.error("Could not connect to MongoDB:", err.message);
    console.error("Is MongoDB running? Check MONGO_URI in server/.env");
    process.exit(1);
  }
}

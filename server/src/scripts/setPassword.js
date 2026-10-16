// Changes a user's password.
// Usage: node src/scripts/setPassword.js <email> <new password>
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../modules/users/user.model.js";

const [email, password] = process.argv.slice(2);

if (!email || !password || password.length < 8) {
  console.log("Usage: node src/scripts/setPassword.js <email> <new password, 8+ characters>");
  process.exit(1);
}

await connectDB();
const user = await User.findOne({ email: email.toLowerCase() });

if (!user) {
  console.log(`No user with email ${email}`);
} else {
  user.password = password; // the model's pre-save hook hashes it
  await user.save();
  console.log(`Password changed for ${user.email}`);
}

await mongoose.disconnect();
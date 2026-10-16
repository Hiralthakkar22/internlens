import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false -> password never comes back in queries unless we ask for it
    password: { type: String, required: true, minlength: 8, select: false },
    college: { type: String, trim: true, maxlength: 100, default: "" },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    savedExperiences: [{ type: mongoose.Schema.Types.ObjectId, ref: "Experience" }],
  },
  { timestamps: true }
);

// Hash the password only when it is new or changed
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// What the frontend is allowed to see about a user
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    college: this.college,
    role: this.role,
    savedExperiences: this.savedExperiences,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model("User", userSchema);

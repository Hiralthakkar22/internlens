import mongoose from "mongoose";
import { slugify } from "../../utils/slugify.js";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    // "Infosys Ltd" and "infosys ltd" should be the same company, the slug makes that easy
    slug: { type: String, required: true, unique: true },
    city: { type: String, trim: true, maxlength: 60, default: "" },
    website: { type: String, trim: true, maxlength: 200, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

companySchema.pre("validate", function () {
  if (this.isModified("name") || !this.slug) this.slug = slugify(this.name);
});

export const Company = mongoose.model("Company", companySchema);

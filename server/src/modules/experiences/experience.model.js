import mongoose from "mongoose";
import {
  ROLE_TYPES,
  ROUND_TYPES,
  TOPICS,
  SOURCES,
  WORK_MODES,
  OUTCOMES,
  DIFFICULTY,
  EXPERIENCE_STATUS,
} from "../../config/constants.js";

const { ObjectId } = mongoose.Schema.Types;

// One round of the hiring process, stored inside the experience (embedded, not a separate collection)
const roundSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ROUND_TYPES, required: true },
    details: { type: String, trim: true, maxlength: 2000, default: "" },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    company: { type: ObjectId, ref: "Company", required: true },
    author: { type: ObjectId, ref: "User", required: true },
    anonymous: { type: Boolean, default: false },

    // the job
    roleTitle: { type: String, required: true, trim: true, maxlength: 80 },
    roleType: { type: String, enum: ROLE_TYPES, required: true },
    location: { type: String, trim: true, maxlength: 60, default: "" },
    workMode: { type: String, enum: WORK_MODES, default: "Onsite" },
    source: { type: String, enum: SOURCES, required: true },
    interviewDate: { type: Date, required: true }, // we only care about month + year

    // the process
    rounds: {
      type: [roundSchema],
      validate: { validator: (v) => v.length > 0 && v.length <= 8, message: "Add 1 to 8 rounds" },
    },
    topics: [{ type: String, enum: TOPICS }],
    difficulty: { type: String, enum: DIFFICULTY, required: true },
    tips: { type: String, trim: true, maxlength: 1500, default: "" },

    // the offer (the part students care about most)
    stipend: { type: Number, min: 0, max: 500000, default: null }, // per month, in rupees. null = not told
    hasBond: { type: Boolean, required: true },
    bondMonths: { type: Number, min: 0, max: 60, default: 0 },
    outcome: { type: String, enum: OUTCOMES, required: true },
    daysToResult: { type: Number, min: 0, max: 365, default: null },

    // community
    upvotes: [{ type: ObjectId, ref: "User" }],
    upvoteCount: { type: Number, default: 0 },

    // moderation: new posts wait for an admin
    status: { type: String, enum: EXPERIENCE_STATUS, default: "pending" },
    reviewNote: { type: String, trim: true, maxlength: 300, default: "" },
  },
  { timestamps: true }
);

// Most reads are "approved experiences of company X", newest or most upvoted first
experienceSchema.index({ company: 1, status: 1, createdAt: -1 });
experienceSchema.index({ status: 1, upvoteCount: -1 });
experienceSchema.index({ author: 1, createdAt: -1 });

export const Experience = mongoose.model("Experience", experienceSchema);

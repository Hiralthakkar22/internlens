import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requireAuth, optionalAuth } from "../../middleware/auth.js";
import { experienceSchema, listQuerySchema } from "./experience.schemas.js";
import {
  listExperiences,
  myExperiences,
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
  toggleUpvote,
} from "./experience.controller.js";

const router = Router();

router.get("/", optionalAuth, validate(listQuerySchema, "query"), listExperiences);
router.get("/mine", requireAuth, myExperiences); // must be above "/:id"
router.get("/:id", optionalAuth, getExperience);

router.post("/", requireAuth, validate(experienceSchema), createExperience);
router.put("/:id", requireAuth, validate(experienceSchema), updateExperience);
router.delete("/:id", requireAuth, deleteExperience);
router.post("/:id/upvote", requireAuth, toggleUpvote);

export default router;

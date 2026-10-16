import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { listForReview, reviewExperience } from "./admin.controller.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get(
  "/experiences",
  validate(z.object({ status: z.enum(["pending", "approved", "rejected"]).default("pending") }), "query"),
  listForReview
);

router.patch(
  "/experiences/:id",
  validate(
    z
      .object({
        status: z.enum(["approved", "rejected"]),
        note: z.string().trim().max(300).default(""),
      })
      .refine((d) => d.status !== "rejected" || d.note.length >= 5, {
        message: "Tell the author why it was rejected",
        path: ["note"],
      })
  ),
  reviewExperience
);

export default router;

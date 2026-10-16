import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { ROLE_TYPES } from "../../config/constants.js";
import { listCompanies, searchCompanies, listCities, getCompany } from "./company.controller.js";

const router = Router();

const listQuery = z.object({
  q: z.string().trim().max(50).optional(),
  city: z.string().trim().max(60).optional(),
  roleType: z.enum(ROLE_TYPES).optional(),
  bondFree: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  minStipend: z.coerce.number().int().min(0).max(500000).optional(),
  sort: z.enum(["popular", "stipend", "recent", "name"]).default("popular"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

router.get("/", validate(listQuery, "query"), listCompanies);
router.get("/search", searchCompanies);
router.get("/cities", listCities);
router.get("/:slug", getCompany);

export default router;

import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { toggleSaved, getSaved } from "./user.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/me/saved", getSaved);
router.post("/me/saved/:id", toggleSaved);

export default router;

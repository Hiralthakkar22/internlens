import { Router } from "express";
import { overview } from "./insights.controller.js";

const router = Router();
router.get("/overview", overview);

export default router;

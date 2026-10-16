import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../../middleware/validate.js";
import { optionalAuth } from "../../middleware/auth.js";
import { registerSchema, loginSchema } from "./auth.schemas.js";
import { register, login, logout, me } from "./auth.controller.js";

const router = Router();

// 20 tries per 15 minutes per IP, slows down password guessing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts. Try again in a few minutes." },
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
// guests get { user: null } instead of a 401, so the browser console stays clean
router.get("/me", optionalAuth, me);

export default router;

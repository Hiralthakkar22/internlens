import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import * as constants from "./config/constants.js";
import authRoutes from "./modules/auth/auth.routes.js";
import companyRoutes from "./modules/companies/company.routes.js";
import experienceRoutes from "./modules/experiences/experience.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import insightRoutes from "./modules/insights/insights.routes.js";
import { notFoundRoute, errorHandler } from "./middleware/errors.js";

export const app = express();

// Render / Vercel sit behind a proxy; needed for secure cookies and the rate limiter
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigins,
    credentials: true, // allow the auth cookie
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
if (!env.isProd) app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true }));

// dropdown values for the frontend, so both sides always use the same lists
app.get("/api/meta", (req, res) => {
  const { EXPERIENCE_STATUS, ...lists } = constants;
  res.json(lists);
});

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/insights", insightRoutes);

app.use(notFoundRoute);
app.use(errorHandler);

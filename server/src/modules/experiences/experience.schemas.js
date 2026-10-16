import { z } from "zod";
import {
  ROLE_TYPES,
  ROUND_TYPES,
  TOPICS,
  SOURCES,
  WORK_MODES,
  OUTCOMES,
  DIFFICULTY,
} from "../../config/constants.js";

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id");

// Empty input from a form ("" or undefined) means "not told", stored as null
const optionalNumber = (max) =>
  z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.coerce.number().int().min(0).max(max).nullable()
  );

export const experienceSchema = z
  .object({
    // either pick an existing company (id) or type a new one (name + city)
    company: z
      .object({
        id: objectId.optional(),
        name: z
          .string()
          .trim()
          .transform((s) => s.replace(/\s+/g, " ")) // "Zentrix   Labs" -> "Zentrix Labs"
          .pipe(z.string().min(2, "Company name is too short").max(80))
          .optional(),
        city: z.string().trim().max(60).optional().default(""),
      })
      .refine((c) => c.id || c.name, { message: "Choose or type a company" }),
    anonymous: z.boolean().default(false),

    roleTitle: z.string().trim().min(2, "Enter the role, like 'React Intern'").max(80),
    roleType: z.enum(ROLE_TYPES),
    location: z.string().trim().max(60).default(""),
    workMode: z.enum(WORK_MODES).default("Onsite"),
    source: z.enum(SOURCES),
    // "2026-08" from <input type="month">
    interviewDate: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Pick the month of the interview")
      .transform((s) => new Date(`${s}-01T00:00:00Z`))
      .refine((d) => d <= new Date(), "Interview month can't be in the future"),

    rounds: z
      .array(
        z.object({
          type: z.enum(ROUND_TYPES),
          details: z.string().trim().max(2000).default(""),
        })
      )
      .min(1, "Add at least one round")
      .max(8, "Up to 8 rounds"),
    topics: z
      .array(z.enum(TOPICS))
      .max(10, "Pick up to 10 topics")
      .default([])
      .transform((t) => [...new Set(t)]),
    difficulty: z.enum(DIFFICULTY),
    tips: z.string().trim().max(1500).default(""),

    stipend: optionalNumber(500000),
    hasBond: z.boolean(),
    bondMonths: z.coerce.number().int().min(0).max(60).default(0),
    outcome: z.enum(OUTCOMES),
    daysToResult: optionalNumber(365),
  })
  .refine((d) => !d.hasBond || d.bondMonths > 0, {
    message: "How many months is the bond?",
    path: ["bondMonths"],
  })
  .transform((d) => ({ ...d, bondMonths: d.hasBond ? d.bondMonths : 0 }));

export const listQuerySchema = z.object({
  company: z.string().trim().max(100).optional(), // company slug
  roleType: z.enum(ROLE_TYPES).optional(),
  outcome: z.enum(OUTCOMES).optional(),
  source: z.enum(SOURCES).optional(),
  topic: z.enum(TOPICS).optional(),
  sort: z.enum(["top", "new"]).default("new"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(30).default(10),
});

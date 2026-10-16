import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../modules/users/user.model.js";
import { unauthorized, forbidden } from "../utils/HttpError.js";

export const AUTH_COOKIE = "il_token";

// Reads the JWT from the httpOnly cookie and puts the user on req.user.
// Throws 401 if the cookie is missing, expired or the user was deleted.
export async function requireAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) throw unauthorized();

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw unauthorized("Your session expired. Log in again.");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw unauthorized();

  req.user = user;
  next();
}

// Same as requireAuth, but does not fail for guests.
// Used on public pages that show extra info (like "you upvoted this") to logged in users.
export async function optionalAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (token) {
    try {
      const payload = jwt.verify(token, env.jwtSecret);
      req.user = await User.findById(payload.sub);
    } catch {
      // bad token on a public page: just treat as a guest
    }
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") throw forbidden("Only admins can do this");
  next();
}

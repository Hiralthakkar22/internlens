import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { User } from "../users/user.model.js";
import { AUTH_COOKIE } from "../../middleware/auth.js";
import { conflict, unauthorized } from "../../utils/HttpError.js";

const WEEK = 7 * 24 * 60 * 60 * 1000;

// The token lives in an httpOnly cookie, so JavaScript in the browser can't read it.
// That protects it from XSS. sameSite + secure change in production because
// the frontend (Vercel) and backend (Render) are on different domains there.
function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    maxAge: WEEK,
    path: "/",
  };
}

function sendSession(res, user, status = 200) {
  const token = jwt.sign({ sub: user._id.toString() }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
  res.cookie(AUTH_COOKIE, token, cookieOptions());
  res.status(status).json({ user: user.toPublic() });
}

export async function register(req, res) {
  const exists = await User.exists({ email: req.body.email });
  if (exists) throw conflict("An account with this email already exists");

  const user = await User.create(req.body);
  sendSession(res, user, 201);
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email }).select("+password");
  // same message for wrong email and wrong password, so nobody can check which emails exist
  if (!user || !(await user.checkPassword(req.body.password))) {
    throw unauthorized("Email or password is wrong");
  }
  sendSession(res, user);
}

export function logout(req, res) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(AUTH_COOKIE, opts);
  res.json({ message: "Logged out" });
}

export function me(req, res) {
  res.json({ user: req.user ? req.user.toPublic() : null });
}

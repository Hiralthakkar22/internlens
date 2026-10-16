// Small wrapper around fetch.
// - always sends the auth cookie (credentials: "include")
// - turns error responses into a thrown ApiError with the server's message

const BASE = (import.meta.env.VITE_API_URL || "") + "/api";

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details; // { fieldName: "message" } from the server validation
  }
}

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your internet or try again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.message || "Something went wrong", data.details);
  return data;
}

// turns { a: 1, b: "", c: undefined } into "?a=1" (skips empty values)
export function toQuery(params) {
  const clean = Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null && v !== false);
  return clean.length ? "?" + new URLSearchParams(clean).toString() : "";
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  del: (path) => request("DELETE", path),
};

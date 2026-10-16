// "Tata Consultancy Services (TCS)" -> "tata-consultancy-services-tcs"
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Used for search boxes: makes "c++" or "(a)" safe inside a RegExp.
export function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

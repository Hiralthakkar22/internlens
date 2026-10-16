const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

// 18500 -> "₹18,500", 0 -> "Unpaid", null -> "Not shared"
export function money(value, { short = false } = {}) {
  if (value === null || value === undefined) return "Not shared";
  if (value === 0) return "Unpaid";
  if (short && value >= 1000) return `₹${Math.round(value / 100) / 10}k`;
  return `₹${rupee.format(value)}`;
}

// "2026-08-01T..." -> "Aug 2026"
export function monthYear(date) {
  return new Date(date).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" });
}

// "3 days ago", "2 months ago"
export function timeAgo(date) {
  const seconds = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    const n = Math.floor(seconds / size);
    if (n >= 1) return `${n} ${unit}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

export function plural(n, word) {
  if (n === 1) return `${n} ${word}`;
  return `${n} ${word.endsWith("y") ? word.slice(0, -1) + "ies" : word + "s"}`;
}

// Same company name always gets the same color for its initials badge
const BADGE_COLORS = ["var(--mint)", "var(--amber)", "var(--sky)", "var(--coral)", "#b28dff", "#5fc8e8"];
export function companyColor(name = "") {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return BADGE_COLORS[hash % BADGE_COLORS.length];
}

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

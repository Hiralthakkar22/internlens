import { companyColor, initials } from "../../lib/format";

const SIZES = {
  sm: "size-9 text-xs rounded-lg",
  md: "size-11 text-sm rounded-xl",
  lg: "size-16 text-xl rounded-2xl",
};

export default function CompanyBadge({ name, size = "md" }) {
  const color = companyColor(name);
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center font-bold ${SIZES[size]}`}
      style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}
    >
      {initials(name)}
    </span>
  );
}

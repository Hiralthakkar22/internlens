// Small colored label. tone decides the color meaning.
const TONES = {
  mint: "text-mint bg-mint/12",
  coral: "text-coral bg-coral/12",
  amber: "text-amber bg-amber/12",
  sky: "text-sky bg-sky/12",
  plain: "text-muted bg-raised",
};

export default function Tag({ tone = "plain", icon: Icon, children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {Icon && <Icon size={14} stroke={2} aria-hidden="true" />}
      {children}
    </span>
  );
}

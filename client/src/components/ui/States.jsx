import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import { Link } from "react-router";

export function Loading({ label = "Loading" }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-muted">
      <IconLoader2 className="animate-spin" size={20} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ error, retry }) {
  return (
    <div className="rounded-2xl border border-coral/40 bg-coral/8 p-6 text-center">
      <IconAlertTriangle className="mx-auto text-coral" size={28} aria-hidden="true" />
      <p className="mt-2 font-medium">{error?.message || "Couldn't load this"}</p>
      {retry && (
        <button onClick={retry} className="btn btn-ghost mt-4">
          Try again
        </button>
      )}
    </div>
  );
}

// An empty screen should tell the user what to do next
export function EmptyState({ icon: Icon, title, text, action, to }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      {Icon && <Icon className="mx-auto text-muted" size={32} stroke={1.5} aria-hidden="true" />}
      <h3 className="mt-3 text-lg">{title}</h3>
      {text && <p className="mx-auto mt-1 max-w-sm text-muted">{text}</p>}
      {action && to && (
        <Link to={to} className="btn btn-primary mt-5">
          {action}
        </Link>
      )}
    </div>
  );
}

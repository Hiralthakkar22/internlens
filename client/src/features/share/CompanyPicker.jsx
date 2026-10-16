import { useId, useState } from "react";
import { IconBuildingPlus, IconCheck, IconX } from "@tabler/icons-react";
import { useCompanySearch } from "../companies/queries";
import { useDebounce } from "../../hooks/useDebounce";
import CompanyBadge from "../../components/ui/CompanyBadge";

// value is { id, name, city } for an existing company or { name, city } for a new one
export default function CompanyPicker({ value, onChange, invalid }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const q = useDebounce(text, 250);
  const { data: results = [] } = useCompanySearch(q);
  const listId = useId();

  // a company is chosen: show it as a chip with a remove button
  if (value?.name) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-line bg-raised p-3">
        <CompanyBadge name={value.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{value.name}</p>
          <p className="text-xs text-muted">{value.id ? value.city || "Already on InternLens" : "New company, will be added"}</p>
        </div>
        <button type="button" onClick={() => onChange(null)} className="rounded-lg p-1.5 text-muted hover:bg-panel hover:text-text" aria-label="Change company">
          <IconX size={18} />
        </button>
      </div>
    );
  }

  const exact = results.some((c) => c.name.toLowerCase() === text.trim().toLowerCase());

  return (
    <div className="relative">
      <input
        className="field"
        role="combobox"
        aria-label="Company"
        aria-expanded={open && text.length > 0}
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        placeholder="Start typing, like Nexora Labs"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && text.trim().length > 1 && (
        <ul id={listId} role="listbox" className="absolute inset-x-0 top-full z-30 mt-2 rounded-xl border border-line bg-panel p-1.5 shadow-2xl shadow-black/30">
          {results.map((c) => (
            <li
              key={c.id}
              role="option"
              aria-selected="false"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChange({ id: c.id, name: c.name, city: c.city })}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-raised"
            >
              <CompanyBadge name={c.name} size="sm" />
              <span className="font-medium">{c.name}</span>
              <span className="ml-auto text-sm text-muted">{c.city}</span>
            </li>
          ))}
          {!exact && (
            <li
              role="option"
              aria-selected="false"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChange({ name: text.trim().replace(/\s+/g, " "), city: "" })}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-mint hover:bg-raised"
            >
              <IconBuildingPlus size={20} aria-hidden="true" />
              Add "{text.trim()}" as a new company
            </li>
          )}
          {exact && (
            <li className="flex items-center gap-2 px-3 py-2 text-xs text-muted">
              <IconCheck size={14} aria-hidden="true" /> Pick it from the list above
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

import { useId, useState } from "react";
import { useNavigate } from "react-router";
import { IconSearch } from "@tabler/icons-react";
import { useCompanySearch } from "./queries";
import { useDebounce } from "../../hooks/useDebounce";
import CompanyBadge from "../../components/ui/CompanyBadge";

// Search box with suggestions. Arrow keys + Enter work, like a normal combobox.
export default function CompanySearch({ size = "lg", placeholder = "Type a company name, like Nexora" }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const q = useDebounce(text, 250);
  const { data: results = [], isFetching } = useCompanySearch(q);
  const navigate = useNavigate();
  const listId = useId();

  function go(company) {
    setOpen(false);
    setText("");
    navigate(`/companies/${company.slug}`);
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && results[active]) go(results[active]);
      else if (text.trim()) navigate(`/companies?q=${encodeURIComponent(text.trim())}`);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showList = open && text.trim().length > 0;
  const big = size === "lg";

  return (
    <div className="relative">
      <IconSearch
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted ${big ? "left-5" : "left-3"}`}
        size={big ? 22 : 18}
        aria-hidden="true"
      />
      <input
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label="Search companies"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        className={`field ${big ? "rounded-2xl py-4 pr-5 pl-14 text-base sm:text-lg" : "pl-10"}`}
      />

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-panel p-1.5 shadow-2xl shadow-black/30"
        >
          {results.map((c, i) => (
            <li
              key={c.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(c)}
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 ${
                i === active ? "bg-raised" : "hover:bg-raised"
              }`}
            >
              <CompanyBadge name={c.name} size="sm" />
              <span className="font-medium">{c.name}</span>
              {c.city && <span className="ml-auto text-sm text-muted">{c.city}</span>}
            </li>
          ))}
          {!isFetching && results.length === 0 && q === text && (
            <li className="px-3 py-3 text-sm text-muted">
              No company called "{text}" yet. Press Enter to search all companies.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

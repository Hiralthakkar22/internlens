import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { IconBuildingSkyscraper, IconLock, IconLockOpen, IconSearch, IconX } from "@tabler/icons-react";
import PageHeader from "../components/ui/PageHeader";
import CompanyBadge from "../components/ui/CompanyBadge";
import Pagination from "../components/ui/Pagination";
import { Loading, ErrorState, EmptyState } from "../components/ui/States";
import { useCompanies, useCities } from "../features/companies/queries";
import { useMeta } from "../hooks/useMeta";
import { useDebounce } from "../hooks/useDebounce";
import { money, plural } from "../lib/format";

const STIPEND_STEPS = [5000, 10000, 15000, 20000, 30000];

function CompanyTile({ c }) {
  // full class names written out, so Tailwind can find them in the code
  const tone =
    c.bondPercent === 0
      ? { text: "text-mint", bar: "bg-mint" }
      : c.bondPercent >= 40
        ? { text: "text-coral", bar: "bg-coral" }
        : { text: "text-amber", bar: "bg-amber" };
  return (
    <article className="relative flex flex-col rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-mint/50">
      <div className="flex items-center gap-3">
        <CompanyBadge name={c.name} />
        <div className="min-w-0">
          <h2 className="truncate text-base">
            <Link to={`/companies/${c.slug}`} className="after:absolute after:inset-0 after:rounded-2xl">
              {c.name}
            </Link>
          </h2>
          <p className="text-sm text-muted">
            {c.city || "City not shared"}, {plural(c.experienceCount, "experience")}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted">Avg stipend</p>
          <p className="num text-2xl font-bold text-amber">{money(c.avgStipend)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Selected</p>
          <p className="num text-lg font-bold">{c.selectionRate === null ? "-" : `${c.selectionRate}%`}</p>
        </div>
      </div>

      {/* bond meter: how many students reported a bond */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className={`flex items-center gap-1 font-medium ${tone.text}`}>
            {c.bondPercent === 0 ? <IconLockOpen size={14} aria-hidden="true" /> : <IconLock size={14} aria-hidden="true" />}
            {c.bondPercent === 0 ? "No bond reported" : `Bond for ${c.bondPercent}% of students`}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-raised">
          <div
            className={`h-1.5 rounded-full ${tone.bar}`}
            style={{ width: `${Math.max(c.bondPercent, c.bondPercent === 0 ? 0 : 4)}%` }}
          />
        </div>
      </div>
    </article>
  );
}

export default function CompaniesPage() {
  const [params, setParams] = useSearchParams();
  const meta = useMeta();
  const { data: cities = [] } = useCities();

  // the search box updates the URL only after typing stops
  const [text, setText] = useState(params.get("q") || "");
  const q = useDebounce(text, 350);

  const filters = {
    q: params.get("q") || "",
    city: params.get("city") || "",
    roleType: params.get("roleType") || "",
    minStipend: params.get("minStipend") || "",
    bondFree: params.get("bondFree") === "true",
    sort: params.get("sort") || "popular",
    page: Number(params.get("page")) || 1,
  };

  // filters live in the URL, so a filtered list can be shared or bookmarked
  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value === "" || value === false || value === null) next.delete(key);
    else next.set(key, String(value));
    if (key !== "page") next.delete("page");
    setParams(next, { replace: key === "q" });
  }

  useEffect(() => {
    if (q !== filters.q) setFilter("q", q.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const { data, isLoading, error, refetch, isPlaceholderData } = useCompanies({ ...filters, limit: 12 });
  const hasFilters = filters.q || filters.city || filters.roleType || filters.minStipend || filters.bondFree;

  return (
    <div>
      <PageHeader title="Companies" text="Every number here comes from experiences students shared. More posts, more reliable numbers." />

      <div className="mb-6 grid gap-3 rounded-2xl border border-line bg-panel p-4 sm:grid-cols-2 lg:grid-cols-6">
        <label className="relative sm:col-span-2">
          <span className="sr-only">Search by name</span>
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
          <input
            type="search"
            className="field pl-10"
            placeholder="Search by name"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <select className="field" value={filters.city} onChange={(e) => setFilter("city", e.target.value)} aria-label="City">
          <option value="">Any city</option>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select className="field" value={filters.roleType} onChange={(e) => setFilter("roleType", e.target.value)} aria-label="Role">
          <option value="">Any role</option>
          {meta.ROLE_TYPES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select className="field" value={filters.minStipend} onChange={(e) => setFilter("minStipend", e.target.value)} aria-label="Minimum stipend">
          <option value="">Any stipend</option>
          {STIPEND_STEPS.map((s) => (
            <option key={s} value={s}>
              {money(s)}+ per month
            </option>
          ))}
        </select>
        <select className="field" value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)} aria-label="Sort by">
          <option value="popular">Most posts</option>
          <option value="stipend">Highest stipend</option>
          <option value="recent">Recently updated</option>
          <option value="name">Name A to Z</option>
        </select>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 lg:col-span-6">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={filters.bondFree}
              onChange={(e) => setFilter("bondFree", e.target.checked)}
            />
            <span className="relative h-6 w-11 rounded-full bg-raised ring-1 ring-line transition-colors peer-checked:bg-mint peer-focus-visible:outline-2 peer-focus-visible:outline-mint after:absolute after:top-1 after:left-1 after:size-4 after:rounded-full after:bg-text after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:bg-mint-ink" />
            Only companies where nobody reported a bond
          </label>
          {hasFilters && (
            <button
              className="flex items-center gap-1 text-sm text-muted hover:text-text"
              onClick={() => {
                setText("");
                setParams(filters.sort !== "popular" ? { sort: filters.sort } : {});
              }}
            >
              <IconX size={16} aria-hidden="true" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {isLoading && <Loading />}
      {error && <ErrorState error={error} retry={refetch} />}
      {data && data.items.length === 0 && (
        <EmptyState
          icon={IconBuildingSkyscraper}
          title="No company matches these filters"
          text="Try removing a filter. Or if you interviewed somewhere that's missing, add it."
          action="Share an experience"
          to="/share"
        />
      )}
      {data && data.items.length > 0 && (
        <>
          <p className="mb-3 text-sm text-muted">{plural(data.total, "company")} found</p>
          <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${isPlaceholderData ? "opacity-60" : ""}`}>
            {data.items.map((c) => (
              <CompanyTile key={c.id} c={c} />
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={(p) => setFilter("page", p)} />
        </>
      )}
    </div>
  );
}

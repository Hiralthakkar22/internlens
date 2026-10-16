import { useState } from "react";
import { Link, useParams } from "react-router";
import { IconPencilPlus, IconMapPin, IconInfoTriangle, IconMoodEmpty } from "@tabler/icons-react";
import CompanyBadge from "../components/ui/CompanyBadge";
import Pagination from "../components/ui/Pagination";
import { Loading, ErrorState, EmptyState } from "../components/ui/States";
import { useCompany } from "../features/companies/queries";
import { useExperiences } from "../features/experiences/queries";
import { Verdicts, ReportGrid } from "../features/companies/ReportCard";
import ExperienceCard from "../features/experiences/ExperienceCard";
import { useMeta } from "../hooks/useMeta";
import { plural, timeAgo } from "../lib/format";

function CompanyExperiences({ slug }) {
  const meta = useMeta();
  const [filters, setFilters] = useState({ roleType: "", outcome: "", sort: "top", page: 1 });
  const { data, isLoading } = useExperiences({ company: slug, ...filters, limit: 6 });
  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value, page: 1 }));

  return (
    <section className="mt-12">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl">Experiences</h2>
        <div className="flex flex-wrap gap-2">
          <select className="field w-auto py-2 text-sm" value={filters.roleType} onChange={set("roleType")} aria-label="Role">
            <option value="">All roles</option>
            {meta.ROLE_TYPES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select className="field w-auto py-2 text-sm" value={filters.outcome} onChange={set("outcome")} aria-label="Result">
            <option value="">Any result</option>
            {meta.OUTCOMES.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <select className="field w-auto py-2 text-sm" value={filters.sort} onChange={set("sort")} aria-label="Sort by">
            <option value="top">Most helpful</option>
            <option value="new">Newest</option>
          </select>
        </div>
      </div>

      {isLoading && <Loading />}
      {data && data.items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">No experiences match these filters.</p>
      )}
      {data && data.items.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {data.items.map((e) => (
              <ExperienceCard key={e.id} experience={e} showCompany={false} />
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={(page) => setFilters((f) => ({ ...f, page }))} />
        </>
      )}
    </section>
  );
}

export default function CompanyPage() {
  const { slug } = useParams();
  const { data, isLoading, error, refetch } = useCompany(slug);

  if (isLoading) return <Loading label="Building the report card" />;
  if (error?.status === 404)
    return <EmptyState icon={IconMoodEmpty} title="Company not found" text="It may have been renamed. Try searching for it." action="Browse companies" to="/companies" />;
  if (error) return <ErrorState error={error} retry={refetch} />;

  const { company, report, platformAvgStipend } = data;
  const shareLink = (
    <Link to="/share" state={{ company: { id: company.id, name: company.name, city: company.city } }} className="btn btn-primary">
      <IconPencilPlus size={18} aria-hidden="true" />
      Share your experience
    </Link>
  );

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <CompanyBadge name={company.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-4xl">{company.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            {company.city && (
              <span className="flex items-center gap-1">
                <IconMapPin size={16} aria-hidden="true" />
                {company.city}
              </span>
            )}
            <span>Based on {plural(report.totalExperiences, "experience")}</span>
            {report.lastUpdated && <span>Updated {timeAgo(report.lastUpdated)}</span>}
          </p>
        </div>
        <div className="hidden sm:block">{shareLink}</div>
      </header>

      {report.totalExperiences === 0 ? (
        <EmptyState
          icon={IconPencilPlus}
          title={`No approved experiences for ${company.name} yet`}
          text="Be the first one. Your post helps the next student decide."
          action="Share your experience"
          to="/share"
        />
      ) : (
        <>
          {report.confidence !== "high" && (
            <p className="mb-4 flex items-start gap-2 rounded-xl bg-amber/10 px-4 py-3 text-sm text-amber">
              <IconInfoTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span className="text-text">
                Only {plural(report.totalExperiences, "student")} shared so far, so these numbers can change a lot with new posts.
              </span>
            </p>
          )}
          <Verdicts report={report} platformAvgStipend={platformAvgStipend} />
          <div className="mt-4">
            <ReportGrid report={report} platformAvgStipend={platformAvgStipend} />
          </div>
          <CompanyExperiences slug={company.slug} />
        </>
      )}

      <div className="mt-8 sm:hidden">{shareLink}</div>
    </div>
  );
}

import { Link } from "react-router";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { IconLockOpen, IconAlertTriangle, IconPencilPlus, IconFlame } from "@tabler/icons-react";
import CompanySearch from "../features/companies/CompanySearch";
import { useOverview } from "../features/companies/queries";
import { useExperiences } from "../features/experiences/queries";
import ExperienceCard from "../features/experiences/ExperienceCard";
import CompanyBadge from "../components/ui/CompanyBadge";
import { Loading, ErrorState } from "../components/ui/States";
import { money, plural } from "../lib/format";

function Panel({ title, text, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-line bg-panel p-5 ${className}`}>
      <h2 className="text-base">{title}</h2>
      {text && <p className="text-sm text-muted">{text}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StipendTrend({ data }) {
  if (data.length < 2) return <p className="text-sm text-muted">Not enough data yet.</p>;
  const points = data.map((d) => ({
    ...d,
    label: new Date(`${d.month}-01`).toLocaleDateString("en-IN", { month: "short" }),
  }));
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="stipendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--amber)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--amber)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            cursor={{ stroke: "var(--line)" }}
            contentStyle={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              color: "var(--text)",
            }}
            formatter={(v, name, item) => [`${money(v)} (${item.payload.count} posts)`, "Avg stipend"]}
            labelStyle={{ color: "var(--muted)" }}
          />
          <Area type="monotone" dataKey="avgStipend" stroke="var(--amber)" strokeWidth={2} fill="url(#stipendFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CompanyRow({ company, right }) {
  return (
    <li>
      <Link to={`/companies/${company.slug}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-raised">
        <CompanyBadge name={company.name} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{company.name}</span>
          <span className="block text-xs text-muted">
            {company.city}, {plural(company.count, "experience")}
          </span>
        </span>
        {right}
      </Link>
    </li>
  );
}

export default function HomePage() {
  const overview = useOverview();
  const recent = useExperiences({ sort: "new", limit: 4 });

  return (
    <div className="space-y-8">
      {/* The main job of the app: look up a company before applying */}
      <section className="pt-2 pb-4 sm:pt-6">
        <h1 className="max-w-2xl text-3xl leading-tight sm:text-5xl">Check a company before you apply.</h1>
        <p className="mt-3 max-w-xl text-muted sm:text-lg">
          Stipend, bond, rounds and the questions they asked. Shared by students who already gave the interview.
        </p>
        <div className="mt-6 max-w-2xl">
          <CompanySearch />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link to="/companies?bondFree=true" className="rounded-full border border-line px-3 py-1.5 text-muted hover:border-mint hover:text-mint">
            Bond-free companies
          </Link>
          <Link to="/companies?sort=stipend" className="rounded-full border border-line px-3 py-1.5 text-muted hover:border-amber hover:text-amber">
            Highest stipend
          </Link>
          <Link to="/companies?sort=recent" className="rounded-full border border-line px-3 py-1.5 text-muted hover:border-sky hover:text-sky">
            Recently interviewed
          </Link>
        </div>
      </section>

      {overview.isLoading && <Loading />}
      {overview.error && <ErrorState error={overview.error} retry={overview.refetch} />}

      {overview.data && (
        <>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
            {[
              { label: "experiences shared", value: overview.data.totals.experiences },
              { label: "companies reviewed", value: overview.data.totals.companies },
              { label: "average stipend", value: money(overview.data.totals.avgStipend), tone: "text-amber" },
              { label: "companies with no bond", value: `${overview.data.totals.bondFreeCompaniesPercent}%`, tone: "text-mint" },
            ].map((s) => (
              <div key={s.label} className="bg-panel px-5 py-4">
                <dd className={`num text-2xl font-bold ${s.tone || ""}`}>{s.value}</dd>
                <dt className="text-sm text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>

          <div className="grid gap-5 lg:grid-cols-5">
            <Panel title="Stipend over the last months" text="Average monthly stipend by interview month" className="lg:col-span-3">
              <StipendTrend data={overview.data.stipendTrend} />
            </Panel>

            <Panel title="Asked a lot lately" text="Topics from interviews in the last 6 months" className="lg:col-span-2">
              <ul className="space-y-2.5">
                {overview.data.hotTopics.map((t, i) => {
                  const max = overview.data.hotTopics[0].count;
                  return (
                    <li key={t.topic} className="grid grid-cols-[96px_1fr_28px] items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 truncate">
                        {i === 0 && <IconFlame size={14} className="text-coral" aria-hidden="true" />}
                        {t.topic}
                      </span>
                      <span className="h-2 rounded-full bg-raised">
                        <span className="block h-2 rounded-full bg-sky" style={{ width: `${(t.count / max) * 100}%` }} />
                      </span>
                      <span className="num text-right text-muted">{t.count}</span>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Panel title="Top paying companies" text="At least 2 experiences shared">
              <ol className="space-y-1">
                {overview.data.topPaying.map((c) => (
                  <CompanyRow
                    key={c.slug}
                    company={c}
                    right={
                      <span className="text-right">
                        <span className="num block font-bold text-amber">{money(c.avgStipend)}</span>
                        {c.bondPercent === 0 && (
                          <span className="flex items-center justify-end gap-1 text-xs text-mint">
                            <IconLockOpen size={12} aria-hidden="true" /> no bond
                          </span>
                        )}
                      </span>
                    }
                  />
                ))}
              </ol>
            </Panel>

            <Panel title="Bond alerts" text="Most students reported a bond at these companies">
              {overview.data.bondAlerts.length === 0 ? (
                <p className="text-sm text-muted">No company has a common bond right now.</p>
              ) : (
                <ul className="space-y-1">
                  {overview.data.bondAlerts.map((c) => (
                    <CompanyRow
                      key={c.slug}
                      company={c}
                      right={
                        <span className="flex items-center gap-1 rounded-md bg-coral/12 px-2 py-1 text-sm font-semibold text-coral">
                          <IconAlertTriangle size={14} aria-hidden="true" />
                          <span className="num">{c.bondPercent}%</span>
                        </span>
                      }
                    />
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-xl">Fresh experiences</h2>
          <Link to="/share" className="btn btn-ghost text-sm">
            <IconPencilPlus size={18} aria-hidden="true" />
            Share yours
          </Link>
        </div>
        {recent.data && (
          <div className="grid gap-4 md:grid-cols-2">
            {recent.data.items.map((e) => (
              <ExperienceCard key={e.id} experience={e} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import {
  IconLock,
  IconLockOpen,
  IconCurrencyRupee,
  IconTarget,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";
import { money, plural } from "../../lib/format";

function Card({ title, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-line bg-panel p-5 ${className}`}>
      <h2 className="text-sm font-semibold text-muted">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/* ---------- the three verdicts at the top: the answer in one line each ---------- */

function stipendVerdict(stipend, platformAvg) {
  if (stipend.average === null) return { tone: "plain", text: "Stipend not shared yet" };
  if (stipend.average === 0) return { tone: "coral", text: "Mostly unpaid" };
  if (!platformAvg) return { tone: "amber", text: `Pays about ${money(stipend.average)}` };
  const diff = Math.round(((stipend.average - platformAvg) / platformAvg) * 100);
  if (Math.abs(diff) < 5) return { tone: "amber", text: `Pays ${money(stipend.average)}, close to average` };
  return {
    tone: diff > 0 ? "mint" : "amber",
    text: `Pays ${money(stipend.average)}, ${Math.abs(diff)}% ${diff > 0 ? "above" : "below"} average`,
  };
}

function bondVerdict(bond) {
  if (bond.level === "none") return { tone: "mint", text: "Nobody reported a bond" };
  const months = bond.averageMonths ? ` (about ${bond.averageMonths} months)` : "";
  if (bond.level === "common") return { tone: "coral", text: `Bond for ${bond.percent}% of students${months}` };
  return { tone: "amber", text: `Some students got a bond${months}` };
}

function selectionVerdict(selection, difficulty) {
  const level = difficulty.label ? `${difficulty.label} interviews` : "Interviews";
  if (selection.rate === null) return { tone: "plain", text: `${level}, no results shared yet` };
  if (selection.rate === 0) return { tone: "coral", text: `${level}, nobody selected yet` };
  const oneIn = Math.round(100 / selection.rate);
  return {
    tone: selection.rate >= 50 ? "mint" : selection.rate >= 25 ? "amber" : "coral",
    text: oneIn <= 1 ? `${level}, most got selected` : `${level}, about 1 in ${oneIn} got selected`,
  };
}

const VERDICT_TONE = {
  mint: "border-mint/40 text-mint",
  amber: "border-amber/40 text-amber",
  coral: "border-coral/50 text-coral",
  plain: "border-line text-muted",
};

export function Verdicts({ report, platformAvgStipend }) {
  const items = [
    { icon: IconCurrencyRupee, ...stipendVerdict(report.stipend, platformAvgStipend) },
    { icon: report.bond.level === "none" ? IconLockOpen : IconLock, ...bondVerdict(report.bond) },
    { icon: IconTarget, ...selectionVerdict(report.selection, report.difficulty) },
  ];
  return (
    <ul className="grid gap-3 md:grid-cols-3">
      {items.map(({ icon: Icon, tone, text }) => (
        <li key={text} className={`flex items-center gap-3 rounded-2xl border-2 bg-panel px-4 py-3.5 font-semibold ${VERDICT_TONE[tone]}`}>
          <Icon size={22} className="shrink-0" aria-hidden="true" />
          <span className="text-text">{text}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- detail cards ---------- */

function StipendCard({ stipend, platformAvg }) {
  const { min, max, average } = stipend;
  // place the average and platform average on one scale from 0 to the biggest value
  const top = Math.max(max ?? 0, platformAvg ?? 0) * 1.1 || 1;
  const pct = (v) => `${Math.min(100, (v / top) * 100)}%`;

  return (
    <Card title="Monthly stipend">
      <p className="num text-4xl font-bold text-amber">{money(average)}</p>
      <p className="mt-1 text-sm text-muted">
        {stipend.reported ? `average of ${plural(stipend.reported, "student")} who shared it` : "Nobody shared the stipend yet"}
        {stipend.unpaid > 0 && `, ${stipend.unpaid} unpaid`}
      </p>

      {stipend.reported > 0 && (
        <div className="mt-6">
          <div className="relative h-2 rounded-full bg-raised" aria-hidden="true">
            <div className="absolute h-2 rounded-full bg-amber/40" style={{ left: pct(min), width: `calc(${pct(max)} - ${pct(min)})` }} />
            <div className="absolute -top-1 size-4 -translate-x-1/2 rounded-full border-2 border-panel bg-amber" style={{ left: pct(average) }} />
            {platformAvg && (
              <div className="absolute -top-2 h-6 w-0.5 -translate-x-1/2 bg-sky" style={{ left: pct(platformAvg) }} />
            )}
          </div>
          <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-muted">
            <span>
              Range <span className="num text-text">{money(min)}</span> to <span className="num text-text">{money(max)}</span>
            </span>
            {platformAvg && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-0.5 bg-sky" aria-hidden="true" />
                All companies avg <span className="num text-text">{money(platformAvg)}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function Ring({ percent, color }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 72 72" className="size-24 -rotate-90" aria-hidden="true">
      <circle cx="36" cy="36" r={r} fill="none" stroke="var(--raised)" strokeWidth="8" />
      {percent > 0 && (
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${(percent / 100) * c} ${c}`}
      />
      )}
    </svg>
  );
}

function BondCard({ bond, total }) {
  const color = bond.level === "none" ? "var(--mint)" : bond.level === "common" ? "var(--coral)" : "var(--amber)";
  return (
    <Card title="Bond" className={bond.level === "common" ? "border-coral/50" : ""}>
      <div className="flex items-center gap-5">
        <div className="relative">
          <Ring percent={bond.percent} color={color} />
          <span className="num absolute inset-0 grid place-items-center text-xl font-bold" style={{ color }}>
            {bond.percent}%
          </span>
        </div>
        <div className="text-sm">
          {bond.level === "none" ? (
            <p>
              None of the <span className="num">{total}</span> students reported a bond or service agreement.
            </p>
          ) : (
            <>
              <p>
                <span className="num font-semibold">{bond.count}</span> of <span className="num">{total}</span> students had to sign a bond.
              </p>
              {bond.averageMonths && (
                <p className="mt-1 text-muted">
                  Usually <span className="num text-text">{bond.averageMonths}</span> months.
                </p>
              )}
              {bond.level === "common" && (
                <p className="mt-2 flex items-start gap-1.5 text-coral">
                  <IconAlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  Ask about the bond in the HR round before you accept.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function SelectionCard({ selection }) {
  const parts = [
    { key: "selected", label: "Selected", value: selection.selected, cls: "bg-mint" },
    { key: "rejected", label: "Rejected", value: selection.rejected, cls: "bg-coral" },
    { key: "waiting", label: "Waiting", value: selection.waiting, cls: "bg-sky" },
    { key: "noResponse", label: "No response", value: selection.noResponse, cls: "bg-muted" },
  ];
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;

  return (
    <Card title="Results">
      <p className="num text-4xl font-bold">{selection.rate === null ? "-" : `${selection.rate}%`}</p>
      <p className="mt-1 text-sm text-muted">selected, out of students who got a final answer</p>
      <div className="mt-5 flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
        {parts.filter((p) => p.value).map((p) => (
          <span key={p.key} className={p.cls} style={{ width: `${(p.value / total) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {parts.map((p) => (
          <li key={p.key} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${p.cls}`} aria-hidden="true" />
            {p.label} <span className="num text-text">{p.value}</span>
          </li>
        ))}
      </ul>
      {selection.averageDaysToResult !== null && (
        <p className="mt-4 border-t border-line pt-3 text-sm">
          Result comes in about <span className="num font-semibold">{selection.averageDaysToResult}</span> days
        </p>
      )}
    </Card>
  );
}

function DifficultyCard({ difficulty }) {
  const levels = [
    { name: "Easy", cls: "bg-mint" },
    { name: "Medium", cls: "bg-amber" },
    { name: "Hard", cls: "bg-coral" },
  ];
  const total = levels.reduce((s, l) => s + (difficulty.counts[l.name] || 0), 0) || 1;
  return (
    <Card title="Difficulty">
      <p className="text-3xl font-bold">{difficulty.label ?? "-"}</p>
      <p className="mt-1 text-sm text-muted">how students rated the interviews</p>
      <ul className="mt-4 space-y-2">
        {levels.map((l) => {
          const n = difficulty.counts[l.name] || 0;
          return (
            <li key={l.name} className="grid grid-cols-[60px_1fr_24px] items-center gap-3 text-sm">
              <span className="text-muted">{l.name}</span>
              <span className="h-2 rounded-full bg-raised">
                <span className={`block h-2 rounded-full ${l.cls}`} style={{ width: `${(n / total) * 100}%` }} />
              </span>
              <span className="num text-right">{n}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function RoundsCard({ rounds, total }) {
  return (
    <Card title="Usual interview process" className="lg:col-span-2">
      {rounds.typical.length === 0 ? (
        <p className="text-sm text-muted">No rounds shared yet.</p>
      ) : (
        <>
          <ol className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-0">
            {rounds.typical.map((type, i) => (
              <li key={i} className="flex items-center gap-3 sm:flex-1 sm:flex-col sm:items-start sm:gap-2">
                <div className="flex items-center sm:w-full">
                  <span className="num grid size-8 shrink-0 place-items-center rounded-full bg-mint/15 text-sm font-bold text-mint">
                    {i + 1}
                  </span>
                  {i < rounds.typical.length - 1 && <span className="mx-2 hidden h-px flex-1 bg-line sm:block" aria-hidden="true" />}
                </div>
                <span className="text-sm font-medium sm:pr-2">{type}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 flex items-start gap-1.5 border-t border-line pt-3 text-sm text-muted">
            <IconInfoCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              <span className="num text-text">{rounds.sharedBy}</span> of <span className="num text-text">{total}</span> students had exactly these rounds. On average there were{" "}
              <span className="num text-text">{rounds.averageCount}</span> rounds.
            </span>
          </p>
        </>
      )}
    </Card>
  );
}

function TopicsCard({ topics }) {
  return (
    <Card title="Topics they asked" className="lg:col-span-2">
      {topics.length === 0 ? (
        <p className="text-sm text-muted">No topics shared yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {topics.map((t) => (
            <li key={t.topic} className="grid grid-cols-[110px_1fr_40px] items-center gap-3 text-sm">
              <span className="truncate">{t.topic}</span>
              <span className="h-2 rounded-full bg-raised">
                <span className="block h-2 rounded-full bg-sky" style={{ width: `${t.percent}%` }} />
              </span>
              <span className="num text-right text-muted">{t.percent}%</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function RoleCard({ roles }) {
  if (roles.length < 2) return null;
  return (
    <Card title="Stipend by role">
      <table className="w-full text-sm">
        <tbody>
          {roles.map((r) => (
            <tr key={r.roleType} className="border-b border-line last:border-0">
              <td className="py-2">{r.roleType}</td>
              <td className="num py-2 text-right font-semibold text-amber">{money(r.average)}</td>
              <td className="py-2 pl-3 text-right text-xs text-muted">{plural(r.count, "post")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export function ReportGrid({ report, platformAvgStipend }) {
  const total = report.totalExperiences;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StipendCard stipend={report.stipend} platformAvg={platformAvgStipend} />
      <BondCard bond={report.bond} total={total} />
      <SelectionCard selection={report.selection} />
      <RoundsCard rounds={report.rounds} total={total} />
      <DifficultyCard difficulty={report.difficulty} />
      <TopicsCard topics={report.topTopics} />
      <RoleCard roles={report.stipendByRole} />
    </div>
  );
}

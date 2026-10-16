import { Link } from "react-router";
import { IconChevronRight, IconCurrencyRupee } from "@tabler/icons-react";
import CompanyBadge from "../../components/ui/CompanyBadge";
import Tag from "../../components/ui/Tag";
import ExperienceActions from "./ExperienceActions";
import { OUTCOME_STYLE, bondTag, ROUND_SHORT } from "./labels";
import { money, monthYear, timeAgo } from "../../lib/format";

export default function ExperienceCard({ experience: e, showCompany = true, footer }) {
  const outcome = OUTCOME_STYLE[e.outcome];
  const bond = bondTag(e.hasBond, e.bondMonths);

  return (
    <article className="group relative rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-mint/50">
      <div className="flex items-start gap-3">
        {showCompany && <CompanyBadge name={e.company.name} />}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold">
            {/* the link covers the whole card (after: pseudo element), buttons sit above it */}
            <Link to={`/experiences/${e.id}`} className="after:absolute after:inset-0 after:rounded-2xl">
              {showCompany ? e.company.name : e.roleTitle}
            </Link>
          </h3>
          <p className="text-sm text-muted">
            {showCompany && <>{e.roleTitle}, </>}
            {monthYear(e.interviewDate)}
          </p>
        </div>
        <Tag tone={outcome.tone} icon={outcome.icon}>
          {e.outcome}
        </Tag>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Tag tone="amber" icon={IconCurrencyRupee}>
          <span className="num">{money(e.stipend).replace("₹", "")}</span>
          {typeof e.stipend === "number" && e.stipend > 0 && <span className="opacity-75">/mo</span>}
        </Tag>
        <Tag tone={bond.tone} icon={bond.icon}>
          {bond.text}
        </Tag>
        <Tag>{e.source}</Tag>
      </div>

      <ol className="mt-4 flex flex-wrap items-center gap-1 text-xs text-muted" aria-label="Interview rounds">
        {e.rounds.map((r, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <IconChevronRight size={12} aria-hidden="true" />}
            <span className="rounded-md border border-line px-1.5 py-0.5">{ROUND_SHORT[r.type] || r.type}</span>
          </li>
        ))}
      </ol>

      <div className="relative z-10 mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
        <p className="truncate text-xs text-muted">
          {e.author ? e.author.name : "Anonymous"}, {timeAgo(e.createdAt)}
        </p>
        {footer ?? <ExperienceActions experience={e} />}
      </div>
    </article>
  );
}

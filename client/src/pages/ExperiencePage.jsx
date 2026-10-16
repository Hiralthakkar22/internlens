import { Link, useNavigate, useParams } from "react-router";
import { IconArrowLeft, IconBulb, IconEdit, IconTrash, IconClock, IconAlertCircle } from "@tabler/icons-react";
import CompanyBadge from "../components/ui/CompanyBadge";
import Tag from "../components/ui/Tag";
import { Loading, ErrorState, EmptyState } from "../components/ui/States";
import { useExperience, useDeleteExperience } from "../features/experiences/queries";
import ExperienceActions from "../features/experiences/ExperienceActions";
import { OUTCOME_STYLE, bondTag, DIFFICULTY_TONE } from "../features/experiences/labels";
import { money, monthYear, timeAgo } from "../lib/format";

function Fact({ label, children }) {
  return (
    <div className="bg-panel px-4 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold">{children}</dd>
    </div>
  );
}

function StatusBanner({ status, note }) {
  if (status === "approved" || !status) return null;
  if (status === "pending")
    return (
      <p className="mb-5 flex items-center gap-2 rounded-xl bg-sky/10 px-4 py-3 text-sm">
        <IconClock size={18} className="text-sky" aria-hidden="true" />
        Waiting for review. Only you can see this post until an admin approves it.
      </p>
    );
  return (
    <div className="mb-5 rounded-xl bg-coral/10 px-4 py-3 text-sm">
      <p className="flex items-center gap-2 font-semibold text-coral">
        <IconAlertCircle size={18} aria-hidden="true" />
        Not approved
      </p>
      {note && <p className="mt-1">Reason: {note}</p>}
      <p className="mt-1 text-muted">Edit the post to fix it, and it goes back for review.</p>
    </div>
  );
}

export default function ExperiencePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: e, isLoading, error, refetch } = useExperience(id);
  const remove = useDeleteExperience();

  if (isLoading) return <Loading />;
  if (error?.status === 404 || error?.status === 400)
    return <EmptyState title="This experience doesn't exist" text="It may have been deleted by its author." action="Browse companies" to="/companies" />;
  if (error) return <ErrorState error={error} retry={refetch} />;

  const outcome = OUTCOME_STYLE[e.outcome];
  const bond = bondTag(e.hasBond, e.bondMonths);

  async function handleDelete() {
    if (!window.confirm("Delete this experience? This can't be undone.")) return;
    await remove.mutateAsync(e.id);
    navigate("/my-posts");
  }

  return (
    <article className="mx-auto max-w-3xl">
      <Link to={`/companies/${e.company.slug}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
        <IconArrowLeft size={16} aria-hidden="true" />
        {e.company.name} report card
      </Link>

      <StatusBanner status={e.status} note={e.reviewNote} />

      <header className="flex flex-wrap items-start gap-4">
        <CompanyBadge name={e.company.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl">{e.roleTitle}</h1>
          <p className="mt-1 text-muted">
            at <Link to={`/companies/${e.company.slug}`} className="font-medium text-text underline decoration-line underline-offset-4 hover:decoration-mint">{e.company.name}</Link>
            , interviewed in {monthYear(e.interviewDate)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Tag tone={outcome.tone} icon={outcome.icon}>
              {e.outcome}
            </Tag>
            <Tag tone={DIFFICULTY_TONE[e.difficulty]}>{e.difficulty} interview</Tag>
            <Tag>{e.roleType}</Tag>
          </div>
        </div>
      </header>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
        <Fact label="Stipend per month">
          <span className="num text-amber">{money(e.stipend)}</span>
        </Fact>
        <Fact label="Bond">
          <span className={bond.tone === "coral" ? "text-coral" : "text-mint"}>{bond.text}</span>
        </Fact>
        <Fact label="Result came in">
          {e.daysToResult === null ? <span className="text-muted">Not shared</span> : <span className="num">{e.daysToResult} days</span>}
        </Fact>
        <Fact label="Applied through">{e.source}</Fact>
        <Fact label="Work mode">{e.workMode}</Fact>
        <Fact label="Location">{e.location || <span className="text-muted">Not shared</span>}</Fact>
      </dl>

      <section className="mt-10">
        <h2 className="text-xl">Rounds</h2>
        <ol className="mt-5 space-y-0">
          {e.rounds.map((r, i) => (
            <li key={i} className="relative grid grid-cols-[32px_1fr] gap-4 pb-6 last:pb-0">
              {i < e.rounds.length - 1 && <span className="absolute top-9 bottom-1 left-4 w-px bg-line" aria-hidden="true" />}
              <span className="num grid size-8 place-items-center rounded-full bg-mint/15 text-sm font-bold text-mint">{i + 1}</span>
              <div className="pt-1">
                <h3 className="font-semibold">{r.type}</h3>
                {r.details ? (
                  <p className="mt-1 whitespace-pre-line text-muted">{r.details}</p>
                ) : (
                  <p className="mt-1 text-sm text-muted italic">No details shared for this round.</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {e.topics.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl">Topics asked</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {e.topics.map((t) => (
              <li key={t}>
                <Tag tone="sky">{t}</Tag>
              </li>
            ))}
          </ul>
        </section>
      )}

      {e.tips && (
        <section className="mt-10 rounded-2xl border border-amber/30 bg-amber/8 p-5">
          <h2 className="flex items-center gap-2 text-base text-amber">
            <IconBulb size={20} aria-hidden="true" />
            Tips for the next student
          </h2>
          <p className="mt-2 whitespace-pre-line">{e.tips}</p>
        </section>
      )}

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <p className="text-sm text-muted">
          Shared by <span className="text-text">{e.author ? e.author.name : "an anonymous student"}</span>
          {e.author?.college && <>, {e.author.college}</>}, {timeAgo(e.createdAt)}
        </p>
        <div className="flex items-center gap-2">
          {e.isMine && (
            <>
              <Link to={`/experiences/${e.id}/edit`} className="btn btn-ghost px-3 py-1.5 text-sm">
                <IconEdit size={16} aria-hidden="true" /> Edit
              </Link>
              <button onClick={handleDelete} disabled={remove.isPending} className="btn btn-ghost px-3 py-1.5 text-sm text-coral">
                <IconTrash size={16} aria-hidden="true" /> Delete
              </button>
            </>
          )}
          <ExperienceActions experience={e} />
        </div>
      </footer>
    </article>
  );
}

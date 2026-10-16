import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconCheck, IconX, IconInbox, IconExternalLink } from "@tabler/icons-react";
import PageHeader from "../../components/ui/PageHeader";
import CompanyBadge from "../../components/ui/CompanyBadge";
import Tag from "../../components/ui/Tag";
import { Loading, ErrorState, EmptyState } from "../../components/ui/States";
import { api } from "../../lib/api";
import { money, monthYear, timeAgo } from "../../lib/format";
import { bondTag } from "../experiences/labels";

const TABS = [
  { key: "pending", label: "Waiting" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

function ReviewItem({ e, status }) {
  const qc = useQueryClient();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const bond = bondTag(e.hasBond, e.bondMonths);

  const review = useMutation({
    mutationFn: (body) => api.patch(`/admin/experiences/${e.id}`, body),
    onSuccess: (_, body) => {
      toast.success(body.status === "approved" ? "Approved, it's live now" : "Rejected, the author can see why");
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["experiences"] });
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["company"] });
      qc.invalidateQueries({ queryKey: ["insights"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <li className="rounded-2xl border border-line bg-panel p-5">
      <div className="flex flex-wrap items-start gap-3">
        <CompanyBadge name={e.company.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {e.company.name}<span className="font-normal text-muted">, {e.roleTitle}</span>
          </p>
          <p className="text-xs text-muted">
            {e.submittedBy?.name} ({e.submittedBy?.email}){e.anonymous && ", posted anonymously"}, {timeAgo(e.createdAt)}
          </p>
        </div>
        <Link to={`/experiences/${e.id}`} className="flex items-center gap-1 text-sm text-muted hover:text-text">
          Open <IconExternalLink size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Tag tone="amber">{money(e.stipend)}</Tag>
        <Tag tone={bond.tone}>{bond.text}</Tag>
        <Tag>{e.outcome}</Tag>
        <Tag>{monthYear(e.interviewDate)}</Tag>
      </div>

      <ol className="mt-3 space-y-1 text-sm">
        {e.rounds.map((r, i) => (
          <li key={i}>
            <span className="font-medium">{r.type}:</span> <span className="text-muted">{r.details || "no details"}</span>
          </li>
        ))}
      </ol>
      {e.reviewNote && <p className="mt-2 text-sm text-coral">Reject reason: {e.reviewNote}</p>}

      {status !== "approved" && !rejecting && (
        <div className="mt-4 flex gap-2">
          <button className="btn btn-primary" disabled={review.isPending} onClick={() => review.mutate({ status: "approved" })}>
            <IconCheck size={18} aria-hidden="true" /> Approve
          </button>
          {status === "pending" && (
            <button className="btn btn-ghost" onClick={() => setRejecting(true)}>
              <IconX size={18} aria-hidden="true" /> Reject
            </button>
          )}
        </div>
      )}
      {status === "approved" && (
        <div className="mt-4">
          <button className="btn btn-ghost text-sm" onClick={() => setRejecting(true)} hidden={rejecting}>
            Take down
          </button>
        </div>
      )}
      {rejecting && (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(ev) => {
            ev.preventDefault();
            review.mutate({ status: "rejected", note });
          }}
        >
          <input
            className="field"
            autoFocus
            value={note}
            onChange={(ev) => setNote(ev.target.value)}
            placeholder="Why? The author will see this, like: Looks like spam, no real rounds."
            maxLength={300}
          />
          <div className="flex gap-2">
            <button className="btn bg-coral text-white" disabled={note.trim().length < 5 || review.isPending}>
              Reject
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setRejecting(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </li>
  );
}

export default function AdminPage() {
  const [status, setStatus] = useState("pending");
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", status],
    queryFn: () => api.get(`/admin/experiences?status=${status}`),
  });

  return (
    <div>
      <PageHeader title="Review queue" text="New posts stay hidden until you approve them. This keeps fake stipend numbers out of the report cards." />

      <div role="tablist" className="mb-6 flex gap-1 rounded-xl border border-line bg-panel p-1 sm:w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={status === t.key}
            onClick={() => setStatus(t.key)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
              status === t.key ? "bg-raised text-text" : "text-muted hover:text-text"
            }`}
          >
            {t.label}
            {data?.counts?.[t.key] !== undefined && <span className="num ml-2 text-muted">{data.counts[t.key]}</span>}
          </button>
        ))}
      </div>

      {isLoading && <Loading />}
      {error && <ErrorState error={error} retry={refetch} />}
      {data?.items.length === 0 && (
        <EmptyState icon={IconInbox} title={status === "pending" ? "All caught up" : "Nothing here"} text={status === "pending" ? "New posts will show up here." : undefined} />
      )}
      {data?.items.length > 0 && (
        <ul className="space-y-4">
          {data.items.map((e) => (
            <ReviewItem key={e.id} e={e} status={status} />
          ))}
        </ul>
      )}
    </div>
  );
}

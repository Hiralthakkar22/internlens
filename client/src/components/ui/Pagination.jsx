import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pages" className="mt-6 flex items-center justify-center gap-3">
      <button
        className="btn btn-ghost px-3"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <IconChevronLeft size={18} />
      </button>
      <span className="text-sm text-muted">
        Page <span className="num text-text">{page}</span> of <span className="num text-text">{pages}</span>
      </span>
      <button
        className="btn btn-ghost px-3"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <IconChevronRight size={18} />
      </button>
    </nav>
  );
}

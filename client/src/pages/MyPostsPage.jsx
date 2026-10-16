import { Link } from "react-router";
import { IconPencilPlus, IconEdit } from "@tabler/icons-react";
import PageHeader from "../components/ui/PageHeader";
import Tag from "../components/ui/Tag";
import { Loading, ErrorState, EmptyState } from "../components/ui/States";
import ExperienceCard from "../features/experiences/ExperienceCard";
import { useMyExperiences } from "../features/experiences/queries";

const STATUS = {
  pending: { tone: "sky", text: "In review" },
  approved: { tone: "mint", text: "Live" },
  rejected: { tone: "coral", text: "Not approved" },
};

export default function MyPostsPage() {
  const { data, isLoading, error, refetch } = useMyExperiences();
  return (
    <div>
      <PageHeader title="My posts" text="Everything you shared, with its review status.">
        <Link to="/share" className="btn btn-primary">
          <IconPencilPlus size={18} aria-hidden="true" /> New post
        </Link>
      </PageHeader>
      {isLoading && <Loading />}
      {error && <ErrorState error={error} retry={refetch} />}
      {data?.length === 0 && (
        <EmptyState
          icon={IconPencilPlus}
          title="Share your first interview"
          text="Gave an interview recently, even a rejected one? It is exactly what the next student needs."
          action="Share an experience"
          to="/share"
        />
      )}
      {data?.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((e) => (
            <ExperienceCard
              key={e.id}
              experience={e}
              footer={
                <div className="flex items-center gap-2">
                  <Tag tone={STATUS[e.status].tone}>{STATUS[e.status].text}</Tag>
                  <Link to={`/experiences/${e.id}/edit`} className="rounded-lg p-1.5 text-muted hover:bg-raised hover:text-text" aria-label="Edit post">
                    <IconEdit size={18} />
                  </Link>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

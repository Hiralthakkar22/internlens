import { IconBookmark } from "@tabler/icons-react";
import PageHeader from "../components/ui/PageHeader";
import { Loading, ErrorState, EmptyState } from "../components/ui/States";
import ExperienceCard from "../features/experiences/ExperienceCard";
import { useSavedExperiences } from "../features/experiences/queries";

export default function SavedPage() {
  const { data, isLoading, error, refetch } = useSavedExperiences();
  return (
    <div>
      <PageHeader title="Saved" text="Experiences you bookmarked to read again before an interview." />
      {isLoading && <Loading />}
      {error && <ErrorState error={error} retry={refetch} />}
      {data?.length === 0 && (
        <EmptyState
          icon={IconBookmark}
          title="Save experiences to read later"
          text="Tap the bookmark on any experience. Handy the night before your interview."
          action="Browse companies"
          to="/companies"
        />
      )}
      {data?.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((e) => (
            <ExperienceCard key={e.id} experience={e} />
          ))}
        </div>
      )}
    </div>
  );
}

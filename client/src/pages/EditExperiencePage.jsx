import { Navigate, useParams } from "react-router";
import PageHeader from "../components/ui/PageHeader";
import { Loading, ErrorState } from "../components/ui/States";
import ShareForm from "../features/share/ShareForm";
import { toFormValues } from "../features/share/formValues";
import { useExperience } from "../features/experiences/queries";
import { useUser } from "../hooks/useAuth";

export default function EditExperiencePage() {
  const { id } = useParams();
  const { user } = useUser();
  const { data, isLoading, error, refetch } = useExperience(id);

  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} retry={refetch} />;
  if (!data.isMine && user?.role !== "admin") return <Navigate to={`/experiences/${id}`} replace />;

  return (
    <div>
      <PageHeader title="Edit experience" text="After you save, the post goes back to review before it is public again." />
      <ShareForm key={id} experienceId={id} initial={toFormValues(data)} />
    </div>
  );
}

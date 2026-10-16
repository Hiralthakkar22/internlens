import { IconMapOff } from "@tabler/icons-react";
import { EmptyState } from "../components/ui/States";

export default function NotFoundPage() {
  return (
    <div className="py-10">
      <EmptyState icon={IconMapOff} title="This page doesn't exist" text="The link may be old or mistyped." action="Go to overview" to="/" />
    </div>
  );
}

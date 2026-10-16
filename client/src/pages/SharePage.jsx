import { useLocation } from "react-router";
import PageHeader from "../components/ui/PageHeader";
import ShareForm from "../features/share/ShareForm";

export default function SharePage() {
  const { state } = useLocation(); // a report card page can pass the company
  return (
    <div>
      <PageHeader
        title="Share your interview experience"
        text="Takes about 5 minutes. Your post is checked by an admin before it goes live, and you can post without your name."
      />
      <ShareForm presetCompany={state?.company} />
    </div>
  );
}

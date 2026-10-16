import { useNavigate } from "react-router";
import { IconArrowBigUp, IconBookmark } from "@tabler/icons-react";
import { toast } from "sonner";
import { useUser } from "../../hooks/useAuth";
import { useUpvote, useToggleSave } from "./queries";

// Upvote + save buttons. Guests are sent to login.
export default function ExperienceActions({ experience }) {
  const { user } = useUser();
  const navigate = useNavigate();
  const upvote = useUpvote();
  const save = useToggleSave();
  const approved = !experience.status || experience.status === "approved";

  function needLogin(action) {
    if (user) return action();
    toast("Log in to do that", { description: "It takes 30 seconds to make an account." });
    navigate("/login");
  }

  if (!approved) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.preventDefault();
          needLogin(() => upvote.mutate(experience.id));
        }}
        aria-pressed={experience.upvotedByMe}
        aria-label={experience.upvotedByMe ? "Remove upvote" : "Mark as helpful"}
        title="Helpful"
        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-sm transition-colors ${
          experience.upvotedByMe ? "bg-mint/12 text-mint" : "text-muted hover:bg-raised hover:text-text"
        }`}
      >
        <IconArrowBigUp size={18} aria-hidden="true" fill={experience.upvotedByMe ? "currentColor" : "none"} />
        <span className="num">{experience.upvoteCount}</span>
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          needLogin(() => save.mutate(experience.id));
        }}
        disabled={save.isPending}
        aria-pressed={experience.savedByMe}
        aria-label={experience.savedByMe ? "Remove from saved" : "Save for later"}
        title={experience.savedByMe ? "Saved" : "Save for later"}
        className={`rounded-lg p-1.5 transition-colors ${
          experience.savedByMe ? "text-amber" : "text-muted hover:bg-raised hover:text-text"
        }`}
      >
        <IconBookmark size={18} aria-hidden="true" fill={experience.savedByMe ? "currentColor" : "none"} />
      </button>
    </div>
  );
}

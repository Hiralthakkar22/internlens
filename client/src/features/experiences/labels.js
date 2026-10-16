import { IconCircleCheck, IconCircleX, IconHourglass, IconMailOff, IconLock, IconLockOpen } from "@tabler/icons-react";

export const OUTCOME_STYLE = {
  Selected: { tone: "mint", icon: IconCircleCheck },
  Rejected: { tone: "coral", icon: IconCircleX },
  Waiting: { tone: "sky", icon: IconHourglass },
  "No response": { tone: "plain", icon: IconMailOff },
};

export function bondTag(hasBond, months) {
  return hasBond
    ? { tone: "coral", icon: IconLock, text: `${months} month bond` }
    : { tone: "mint", icon: IconLockOpen, text: "No bond" };
}

export const DIFFICULTY_TONE = { Easy: "mint", Medium: "amber", Hard: "coral" };

// short names so a round sequence fits on one line in cards
export const ROUND_SHORT = {
  "Online Test": "Test",
  Technical: "Tech",
  "Machine Coding": "Coding",
  "Group Discussion": "GD",
  Managerial: "Manager",
  HR: "HR",
};

// Converting between what the API sends/expects and what the form fields hold

export function thisMonth() {
  return new Date().toISOString().slice(0, 7);
}

export const EMPTY = {
  company: null,
  roleTitle: "",
  roleType: "",
  location: "",
  workMode: "Onsite",
  source: "",
  interviewDate: thisMonth(),
  rounds: [{ type: "", details: "" }],
  topics: [],
  difficulty: "",
  tips: "",
  stipendStatus: "paid",
  stipend: "",
  hasBond: "no",
  bondMonths: "",
  outcome: "",
  daysToResult: "",
  anonymous: false,
};

// experience from the API -> form values (for editing)
export function toFormValues(e) {
  return {
    ...EMPTY,
    company: { id: e.company.id, name: e.company.name, city: e.company.city },
    roleTitle: e.roleTitle,
    roleType: e.roleType,
    location: e.location,
    workMode: e.workMode,
    source: e.source,
    interviewDate: e.interviewDate.slice(0, 7),
    rounds: e.rounds.map((r) => ({ type: r.type, details: r.details })),
    topics: e.topics,
    difficulty: e.difficulty,
    tips: e.tips,
    stipendStatus: e.stipend === null ? "unknown" : e.stipend === 0 ? "unpaid" : "paid",
    stipend: e.stipend ? String(e.stipend) : "",
    hasBond: e.hasBond ? "yes" : "no",
    bondMonths: e.bondMonths ? String(e.bondMonths) : "",
    outcome: e.outcome,
    daysToResult: e.daysToResult === null ? "" : String(e.daysToResult),
    anonymous: e.anonymous,
  };
}

// form values -> what the API expects
export function toPayload(v) {
  return {
    company: v.company.id ? { id: v.company.id } : { name: v.company.name, city: v.company.city || "" },
    roleTitle: v.roleTitle,
    roleType: v.roleType,
    location: v.location,
    workMode: v.workMode,
    source: v.source,
    interviewDate: v.interviewDate,
    rounds: v.rounds,
    topics: v.topics,
    difficulty: v.difficulty,
    tips: v.tips,
    stipend: v.stipendStatus === "unknown" ? null : v.stipendStatus === "unpaid" ? 0 : Number(v.stipend),
    hasBond: v.hasBond === "yes",
    bondMonths: v.hasBond === "yes" ? Number(v.bondMonths) : 0,
    outcome: v.outcome,
    daysToResult: v.daysToResult === "" ? null : Number(v.daysToResult),
    anonymous: v.anonymous,
  };
}

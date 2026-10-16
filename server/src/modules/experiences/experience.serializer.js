// Shapes an experience document for the frontend.
// - hides the author when the post is anonymous
// - adds upvotedByMe / savedByMe for the logged in user
// - never sends the full upvotes array (it can get big and it lists user ids)

export function serializeExperience(exp, viewer) {
  const viewerId = viewer?._id?.toString();
  const authorId = exp.author?._id?.toString() ?? exp.author?.toString();
  const isMine = Boolean(viewerId && viewerId === authorId);

  let author = null;
  if (!exp.anonymous && exp.author?.name) {
    author = { id: authorId, name: exp.author.name, college: exp.author.college || "" };
  }

  return {
    id: exp._id,
    company: exp.company?.name
      ? { id: exp.company._id, name: exp.company.name, slug: exp.company.slug, city: exp.company.city }
      : exp.company,
    author,
    anonymous: exp.anonymous,
    isMine,
    roleTitle: exp.roleTitle,
    roleType: exp.roleType,
    location: exp.location,
    workMode: exp.workMode,
    source: exp.source,
    interviewDate: exp.interviewDate,
    rounds: exp.rounds,
    topics: exp.topics,
    difficulty: exp.difficulty,
    tips: exp.tips,
    stipend: exp.stipend,
    hasBond: exp.hasBond,
    bondMonths: exp.bondMonths,
    outcome: exp.outcome,
    daysToResult: exp.daysToResult,
    upvoteCount: exp.upvoteCount,
    upvotedByMe: Boolean(viewerId && exp.upvotes?.some((id) => id.toString() === viewerId)),
    savedByMe: Boolean(viewer?.savedExperiences?.some((id) => id.toString() === exp._id.toString())),
    // status and review note only matter to the author and admins
    ...((isMine || viewer?.role === "admin") && { status: exp.status, reviewNote: exp.reviewNote }),
    createdAt: exp.createdAt,
    updatedAt: exp.updatedAt,
  };
}

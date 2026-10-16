// Builds the "Company Report Card" from a company's approved experiences.
//
// These are plain functions (no database, no Express), so they are easy to
// test and easy to explain: experiences go in, numbers come out.

const DIFFICULTY_SCORE = { Easy: 1, Medium: 2, Hard: 3 };
const SCORE_LABEL = { 1: "Easy", 2: "Medium", 3: "Hard" };

export function average(numbers) {
  if (numbers.length === 0) return null;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function round(n, digits = 0) {
  if (n === null || n === undefined) return null;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function countBy(items) {
  const counts = {};
  for (const item of items) counts[item] = (counts[item] || 0) + 1;
  return counts;
}

export function stipendStats(experiences) {
  const values = experiences.map((e) => e.stipend).filter((s) => typeof s === "number");
  return {
    reported: values.length,
    average: round(average(values)),
    min: values.length ? Math.min(...values) : null,
    max: values.length ? Math.max(...values) : null,
    unpaid: values.filter((s) => s === 0).length,
  };
}

export function bondStats(experiences) {
  const total = experiences.length;
  const withBond = experiences.filter((e) => e.hasBond);
  const percent = total ? round((withBond.length / total) * 100) : 0;

  let level = "none"; // nobody reported a bond
  if (percent >= 40) level = "common";
  else if (percent > 0) level = "some";

  return {
    count: withBond.length,
    percent,
    level,
    averageMonths: round(average(withBond.map((e) => e.bondMonths).filter((m) => m > 0))),
  };
}

export function selectionStats(experiences) {
  const outcomes = countBy(experiences.map((e) => e.outcome));
  const selected = outcomes.Selected || 0;
  const rejected = outcomes.Rejected || 0;
  const decided = selected + rejected;
  return {
    selected,
    rejected,
    waiting: outcomes.Waiting || 0,
    noResponse: outcomes["No response"] || 0,
    // only count people who got a final answer, "waiting" would make the rate look worse than it is
    rate: decided ? round((selected / decided) * 100) : null,
    averageDaysToResult: round(
      average(experiences.map((e) => e.daysToResult).filter((d) => typeof d === "number"))
    ),
  };
}

export function difficultyStats(experiences) {
  const counts = { Easy: 0, Medium: 0, Hard: 0, ...countBy(experiences.map((e) => e.difficulty)) };
  const score = average(experiences.map((e) => DIFFICULTY_SCORE[e.difficulty]).filter(Boolean));
  return {
    counts,
    score: round(score, 1), // 1.0 to 3.0, used for the meter on the frontend
    label: score ? SCORE_LABEL[Math.round(score)] : null,
  };
}

// The most common order of rounds, e.g. ["Online Test", "Technical", "HR"].
// If two orders are equally common, the one seen most recently wins.
export function typicalRounds(experiences) {
  if (experiences.length === 0) return { typical: [], averageCount: null };

  const seen = new Map(); // "Online Test>Technical>HR" -> { count, latest }
  for (const e of experiences) {
    const key = e.rounds.map((r) => r.type).join(">");
    const time = new Date(e.interviewDate).getTime();
    const entry = seen.get(key) || { count: 0, latest: 0 };
    entry.count += 1;
    entry.latest = Math.max(entry.latest, time);
    seen.set(key, entry);
  }

  let bestKey = null;
  let best = { count: 0, latest: 0 };
  for (const [key, entry] of seen) {
    if (entry.count > best.count || (entry.count === best.count && entry.latest > best.latest)) {
      bestKey = key;
      best = entry;
    }
  }

  return {
    typical: bestKey ? bestKey.split(">") : [],
    sharedBy: best.count, // how many experiences had exactly this order
    averageCount: round(average(experiences.map((e) => e.rounds.length)), 1),
  };
}

// Percent of experiences that mention each topic, highest first
export function topTopics(experiences, limit = 6) {
  const counts = countBy(experiences.flatMap((e) => [...new Set(e.topics)]));
  return Object.entries(counts)
    .map(([topic, count]) => ({ topic, count, percent: round((count / experiences.length) * 100) }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic))
    .slice(0, limit);
}

export function stipendByRole(experiences) {
  const groups = {};
  for (const e of experiences) {
    if (typeof e.stipend !== "number") continue;
    (groups[e.roleType] ||= []).push(e.stipend);
  }
  return Object.entries(groups)
    .map(([roleType, values]) => ({ roleType, average: round(average(values)), count: values.length }))
    .sort((a, b) => b.average - a.average);
}

// Few experiences = numbers can be misleading, so we tell the user how sure we are
export function confidenceLevel(count) {
  if (count >= 8) return "high";
  if (count >= 3) return "medium";
  return "low";
}

export function buildReportCard(experiences) {
  return {
    totalExperiences: experiences.length,
    confidence: confidenceLevel(experiences.length),
    stipend: stipendStats(experiences),
    bond: bondStats(experiences),
    selection: selectionStats(experiences),
    difficulty: difficultyStats(experiences),
    rounds: typicalRounds(experiences),
    topTopics: topTopics(experiences),
    stipendByRole: stipendByRole(experiences),
    sources: countBy(experiences.map((e) => e.source)),
    workModes: countBy(experiences.map((e) => e.workMode)),
    lastUpdated: experiences.reduce(
      (latest, e) => (!latest || e.createdAt > latest ? e.createdAt : latest),
      null
    ),
  };
}

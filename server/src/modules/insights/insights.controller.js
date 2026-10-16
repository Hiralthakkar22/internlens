import { Experience } from "../experiences/experience.model.js";
import { Company } from "../companies/company.model.js";

const APPROVED = { status: "approved" };

// GET /api/insights/overview  -> numbers for the home dashboard
export async function overview(req, res) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [totals, perCompany, hotTopics, monthly] = await Promise.all([
    Experience.aggregate([
      { $match: APPROVED },
      {
        $group: {
          _id: null,
          experiences: { $sum: 1 },
          avgStipend: { $avg: "$stipend" },
          withBond: { $sum: { $cond: ["$hasBond", 1, 0] } },
          selected: { $sum: { $cond: [{ $eq: ["$outcome", "Selected"] }, 1, 0] } },
        },
      },
    ]),

    // per company: used for "top paying" and "bond alert" lists
    Experience.aggregate([
      { $match: APPROVED },
      {
        $group: {
          _id: "$company",
          count: { $sum: 1 },
          avgStipend: { $avg: "$stipend" },
          withBond: { $sum: { $cond: ["$hasBond", 1, 0] } },
        },
      },
    ]),

    // topics asked in the last 6 months
    Experience.aggregate([
      { $match: { ...APPROVED, interviewDate: { $gte: sixMonthsAgo } } },
      { $unwind: "$topics" },
      { $group: { _id: "$topics", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 8 },
    ]),

    // average stipend per month for the trend chart
    Experience.aggregate([
      { $match: { ...APPROVED, stipend: { $ne: null } } },
      {
        $group: {
          _id: { y: { $year: "$interviewDate" }, m: { $month: "$interviewDate" } },
          avgStipend: { $avg: "$stipend" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
  ]);

  const companies = await Company.find({ _id: { $in: perCompany.map((c) => c._id) } })
    .select("name slug city")
    .lean();
  const byId = new Map(companies.map((c) => [c._id.toString(), c]));
  const withInfo = perCompany
    .map((c) => {
      const info = byId.get(c._id.toString());
      return info && {
        name: info.name,
        slug: info.slug,
        city: info.city,
        count: c.count,
        avgStipend: c.avgStipend === null ? null : Math.round(c.avgStipend),
        bondPercent: Math.round((c.withBond / c.count) * 100),
      };
    })
    .filter(Boolean);

  // need at least 2 experiences so one random post can't put a company on top
  const topPaying = withInfo
    .filter((c) => c.count >= 2 && c.avgStipend !== null)
    .sort((a, b) => b.avgStipend - a.avgStipend)
    .slice(0, 5);

  const bondAlerts = withInfo
    .filter((c) => c.bondPercent >= 40)
    .sort((a, b) => b.bondPercent - a.bondPercent || b.count - a.count)
    .slice(0, 5);

  const t = totals[0] || { experiences: 0, avgStipend: null, withBond: 0, selected: 0 };
  const bondFreeCompanies = withInfo.filter((c) => c.bondPercent === 0).length;

  res.json({
    totals: {
      experiences: t.experiences,
      companies: withInfo.length,
      avgStipend: t.avgStipend === null ? null : Math.round(t.avgStipend),
      bondFreeCompaniesPercent: withInfo.length
        ? Math.round((bondFreeCompanies / withInfo.length) * 100)
        : 0,
      selections: t.selected,
    },
    topPaying,
    bondAlerts,
    hotTopics: hotTopics.map((h) => ({ topic: h._id, count: h.count })),
    stipendTrend: monthly.slice(-12).map((m) => ({
      month: `${m._id.y}-${String(m._id.m).padStart(2, "0")}`,
      avgStipend: Math.round(m.avgStipend),
      count: m.count,
    })),
  });
}

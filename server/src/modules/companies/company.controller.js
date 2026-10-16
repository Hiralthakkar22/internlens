import { Company } from "./company.model.js";
import { Experience } from "../experiences/experience.model.js";
import { buildReportCard } from "./reportCard.js";
import { escapeRegex } from "../../utils/slugify.js";
import { pageInfo } from "../../utils/pagination.js";
import { notFound } from "../../utils/HttpError.js";

const SORTERS = {
  popular: (a, b) => b.experienceCount - a.experienceCount,
  stipend: (a, b) => (b.avgStipend ?? -1) - (a.avgStipend ?? -1),
  recent: (a, b) => new Date(b.lastExperienceAt) - new Date(a.lastExperienceAt),
  name: (a, b) => a.name.localeCompare(b.name),
};

// GET /api/companies
// One aggregation groups all approved experiences by company and calculates the
// numbers for each card. Then the filters that depend on those numbers run on the result.
export async function listCompanies(req, res) {
  const { q, city, roleType, bondFree, minStipend, sort, page, limit } = req.validQuery;

  const match = { status: "approved" };
  if (roleType) match.roleType = roleType;

  if (q || city) {
    const companyFilter = {};
    if (q) companyFilter.name = { $regex: escapeRegex(q), $options: "i" };
    if (city) companyFilter.city = { $regex: `^${escapeRegex(city)}$`, $options: "i" };
    const ids = await Company.find(companyFilter).distinct("_id");
    match.company = { $in: ids };
  }

  const groups = await Experience.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$company",
        experienceCount: { $sum: 1 },
        avgStipend: { $avg: "$stipend" }, // $avg skips null, so "not told" doesn't pull the average down
        bondCount: { $sum: { $cond: ["$hasBond", 1, 0] } },
        selectedCount: { $sum: { $cond: [{ $eq: ["$outcome", "Selected"] }, 1, 0] } },
        decidedCount: {
          $sum: { $cond: [{ $in: ["$outcome", ["Selected", "Rejected"]] }, 1, 0] },
        },
        lastExperienceAt: { $max: "$createdAt" },
      },
    },
  ]);

  let rows = groups.map((g) => ({
    companyId: g._id,
    experienceCount: g.experienceCount,
    avgStipend: g.avgStipend === null ? null : Math.round(g.avgStipend),
    bondPercent: Math.round((g.bondCount / g.experienceCount) * 100),
    selectionRate: g.decidedCount ? Math.round((g.selectedCount / g.decidedCount) * 100) : null,
    lastExperienceAt: g.lastExperienceAt,
  }));

  if (bondFree) rows = rows.filter((r) => r.bondPercent === 0);
  if (minStipend) rows = rows.filter((r) => (r.avgStipend ?? 0) >= minStipend);

  // attach names before sorting so "name" sort works
  const companies = await Company.find({ _id: { $in: rows.map((r) => r.companyId) } })
    .select("name slug city")
    .lean();
  const byId = new Map(companies.map((c) => [c._id.toString(), c]));

  const items = rows
    .map(({ companyId, ...stats }) => {
      const c = byId.get(companyId.toString());
      return c && { id: c._id, name: c.name, slug: c.slug, city: c.city, ...stats };
    })
    .filter(Boolean)
    .sort(SORTERS[sort]);

  const start = (page - 1) * limit;
  res.json({ items: items.slice(start, start + limit), ...pageInfo(items.length, page, limit) });
}

// GET /api/companies/search?q=inf  (for the autocomplete in the share form)
export async function searchCompanies(req, res) {
  const q = String(req.query.q || "").trim().slice(0, 50);
  if (!q) return res.json({ items: [] });

  const items = await Company.find({ name: { $regex: escapeRegex(q), $options: "i" } })
    .select("name slug city")
    .sort({ name: 1 })
    .limit(8)
    .lean();
  res.json({ items: items.map((c) => ({ id: c._id, name: c.name, slug: c.slug, city: c.city })) });
}

// GET /api/companies/cities  (for the city filter)
export async function listCities(req, res) {
  const cities = await Company.distinct("city", { city: { $ne: "" } });
  res.json({ items: cities.sort() });
}

// GET /api/companies/:slug  -> company + report card
export async function getCompany(req, res) {
  const company = await Company.findOne({ slug: req.params.slug }).lean();
  if (!company) throw notFound("Company not found");

  const [experiences, platform] = await Promise.all([
    Experience.find({ company: company._id, status: "approved" })
      .select("roleType workMode source interviewDate rounds topics difficulty stipend hasBond bondMonths outcome daysToResult createdAt")
      .lean(),
    // average stipend of the whole platform, so we can say "above / below average"
    Experience.aggregate([
      { $match: { status: "approved", stipend: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: "$stipend" } } },
    ]),
  ]);

  res.json({
    company: {
      id: company._id,
      name: company.name,
      slug: company.slug,
      city: company.city,
      website: company.website,
    },
    report: buildReportCard(experiences),
    platformAvgStipend: platform[0] ? Math.round(platform[0].avg) : null,
  });
}

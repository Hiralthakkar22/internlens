import { Experience } from "./experience.model.js";
import { Company } from "../companies/company.model.js";
import { serializeExperience } from "./experience.serializer.js";
import { slugify } from "../../utils/slugify.js";
import { pageInfo } from "../../utils/pagination.js";
import { badRequest, forbidden, notFound } from "../../utils/HttpError.js";

const POPULATE = [
  { path: "company", select: "name slug city" },
  { path: "author", select: "name college" },
];

// Finds the company the user picked, or creates it the first time someone mentions it.
// The slug makes "Infosys" and "infosys " the same company.
async function resolveCompany({ id, name, city }, user) {
  if (id) {
    const company = await Company.findById(id);
    if (!company) throw badRequest("That company does not exist anymore");
    return company;
  }
  const slug = slugify(name);
  if (!slug) throw badRequest("Enter a valid company name");

  // upsert = one atomic step, so two people adding the same new company at once don't create two
  return Company.findOneAndUpdate(
    { slug },
    { $setOnInsert: { name, slug, city, createdBy: user._id } },
    { upsert: true, returnDocument: "after" }
  );
}

async function findOwnedOrAdmin(id, user) {
  const exp = await Experience.findById(id);
  if (!exp) throw notFound("Experience not found");
  const isOwner = exp.author.toString() === user._id.toString();
  if (!isOwner && user.role !== "admin") throw forbidden();
  return exp;
}

// GET /api/experiences
export async function listExperiences(req, res) {
  const { company, roleType, outcome, source, topic, sort, page, limit } = req.validQuery;

  const filter = { status: "approved" };
  if (company) {
    const found = await Company.findOne({ slug: company }).select("_id");
    if (!found) return res.json({ items: [], ...pageInfo(0, page, limit) });
    filter.company = found._id;
  }
  if (roleType) filter.roleType = roleType;
  if (outcome) filter.outcome = outcome;
  if (source) filter.source = source;
  if (topic) filter.topics = topic;

  const order = sort === "top" ? { upvoteCount: -1, createdAt: -1 } : { createdAt: -1 };

  const [items, total] = await Promise.all([
    Experience.find(filter)
      .sort(order)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(POPULATE)
      .lean(),
    Experience.countDocuments(filter),
  ]);

  res.json({
    items: items.map((e) => serializeExperience(e, req.user)),
    ...pageInfo(total, page, limit),
  });
}

// GET /api/experiences/mine
export async function myExperiences(req, res) {
  const items = await Experience.find({ author: req.user._id })
    .sort({ createdAt: -1 })
    .populate(POPULATE)
    .lean();
  res.json({ items: items.map((e) => serializeExperience(e, req.user)) });
}

// GET /api/experiences/:id
export async function getExperience(req, res) {
  const exp = await Experience.findById(req.params.id).populate(POPULATE).lean();
  if (!exp) throw notFound("Experience not found");

  // pending / rejected posts are only visible to the author and admins
  if (exp.status !== "approved") {
    const isOwner = req.user && exp.author._id.toString() === req.user._id.toString();
    if (!isOwner && req.user?.role !== "admin") throw notFound("Experience not found");
  }
  res.json({ experience: serializeExperience(exp, req.user) });
}

// POST /api/experiences
export async function createExperience(req, res) {
  const { company: companyInput, ...data } = req.body;
  const company = await resolveCompany(companyInput, req.user);

  const exp = await Experience.create({
    ...data,
    company: company._id,
    author: req.user._id,
    // admins are trusted, everyone else waits for review
    status: req.user.role === "admin" ? "approved" : "pending",
  });
  await exp.populate(POPULATE);
  res.status(201).json({ experience: serializeExperience(exp.toObject(), req.user) });
}

// PUT /api/experiences/:id
export async function updateExperience(req, res) {
  const exp = await findOwnedOrAdmin(req.params.id, req.user);
  const { company: companyInput, ...data } = req.body;
  const company = await resolveCompany(companyInput, req.user);

  exp.set({ ...data, company: company._id });
  // an edited post has to be checked again (otherwise someone could edit an approved post into spam)
  if (req.user.role !== "admin") {
    exp.status = "pending";
    exp.reviewNote = "";
  }
  await exp.save();
  await exp.populate(POPULATE);
  res.json({ experience: serializeExperience(exp.toObject(), req.user) });
}

// DELETE /api/experiences/:id
export async function deleteExperience(req, res) {
  const exp = await findOwnedOrAdmin(req.params.id, req.user);
  await exp.deleteOne();
  res.json({ message: "Experience deleted" });
}

// POST /api/experiences/:id/upvote  (toggle)
// Two conditional updates instead of "read, change, save": if the same user clicks
// twice very fast, the count can never go wrong because MongoDB checks the condition
// and updates in one step.
export async function toggleUpvote(req, res) {
  const id = req.params.id;
  const userId = req.user._id;

  const added = await Experience.updateOne(
    { _id: id, status: "approved", upvotes: { $ne: userId } },
    { $addToSet: { upvotes: userId }, $inc: { upvoteCount: 1 } }
  );

  let upvoted = true;
  if (added.modifiedCount === 0) {
    const removed = await Experience.updateOne(
      { _id: id, status: "approved", upvotes: userId },
      { $pull: { upvotes: userId }, $inc: { upvoteCount: -1 } }
    );
    if (removed.modifiedCount === 0) throw notFound("Experience not found");
    upvoted = false;
  }

  const { upvoteCount } = await Experience.findById(id).select("upvoteCount").lean();
  res.json({ upvoted, upvoteCount });
}

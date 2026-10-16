import { Experience } from "../experiences/experience.model.js";
import { serializeExperience } from "../experiences/experience.serializer.js";
import { notFound } from "../../utils/HttpError.js";

// GET /api/admin/experiences?status=pending
export async function listForReview(req, res) {
  const { status } = req.validQuery;

  const [items, counts] = await Promise.all([
    Experience.find({ status })
      .sort({ createdAt: status === "pending" ? 1 : -1 }) // oldest pending first, like a queue
      .limit(100)
      .populate([
        { path: "company", select: "name slug city" },
        { path: "author", select: "name college email" },
      ])
      .lean(),
    Experience.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  res.json({
    items: items.map((e) => ({
      ...serializeExperience(e, req.user),
      // admins see who wrote it even when it is anonymous for everyone else
      submittedBy: e.author ? { name: e.author.name, email: e.author.email } : null,
    })),
    counts: Object.fromEntries(counts.map((c) => [c._id, c.count])),
  });
}

// PATCH /api/admin/experiences/:id  { status: "approved" | "rejected", note }
export async function reviewExperience(req, res) {
  const { status, note } = req.body;
  const exp = await Experience.findByIdAndUpdate(
    req.params.id,
    { status, reviewNote: status === "rejected" ? note : "" },
    { returnDocument: "after", runValidators: true }
  );
  if (!exp) throw notFound("Experience not found");
  res.json({ id: exp._id, status: exp.status });
}

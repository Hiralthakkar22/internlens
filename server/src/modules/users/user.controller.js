import { User } from "./user.model.js";
import { Experience } from "../experiences/experience.model.js";
import { serializeExperience } from "../experiences/experience.serializer.js";
import { notFound } from "../../utils/HttpError.js";

// POST /api/users/me/saved/:id  (toggle save / unsave)
export async function toggleSaved(req, res) {
  const id = req.params.id;
  const exists = await Experience.exists({ _id: id, status: "approved" });
  if (!exists) throw notFound("Experience not found");

  const alreadySaved = req.user.savedExperiences.some((s) => s.toString() === id);
  const update = alreadySaved
    ? { $pull: { savedExperiences: id } }
    : { $addToSet: { savedExperiences: id } };
  await User.updateOne({ _id: req.user._id }, update);

  res.json({ saved: !alreadySaved });
}

// GET /api/users/me/saved
export async function getSaved(req, res) {
  const items = await Experience.find({ _id: { $in: req.user.savedExperiences }, status: "approved" })
    .sort({ createdAt: -1 })
    .populate([
      { path: "company", select: "name slug city" },
      { path: "author", select: "name college" },
    ])
    .lean();
  res.json({ items: items.map((e) => serializeExperience(e, req.user)) });
}

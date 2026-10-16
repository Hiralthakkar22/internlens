import { badRequest } from "../utils/HttpError.js";

// validate(schema) checks req.body against a zod schema.
// validate(schema, "query") checks the query string instead.
// On success the parsed (cleaned) data replaces the original.
export function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const fields = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || "form";
        if (!fields[key]) fields[key] = issue.message;
      }
      const first = Object.values(fields)[0];
      throw badRequest(first || "Invalid data", fields);
    }
    // req.query is read-only in Express 5, so parsed queries go on req.validQuery
    if (source === "query") req.validQuery = result.data;
    else req[source] = result.data;
    next();
  };
}

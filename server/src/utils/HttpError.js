// An error that already knows which HTTP status code it should send.
// Throw it from anywhere, the error middleware turns it into a JSON response.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (msg, details) => new HttpError(400, msg, details);
export const unauthorized = (msg = "Please log in first") => new HttpError(401, msg);
export const forbidden = (msg = "You are not allowed to do this") => new HttpError(403, msg);
export const notFound = (msg = "Not found") => new HttpError(404, msg);
export const conflict = (msg) => new HttpError(409, msg);

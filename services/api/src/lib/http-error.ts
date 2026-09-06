export type ErrorDetails = Record<string, unknown> | unknown[];

export class HttpError extends Error {
  code: string;
  details?: ErrorDetails;
  expose: boolean;
  statusCode: number;

  constructor(
    statusCode: number,
    message: string,
    options: { code?: string; details?: ErrorDetails; expose?: boolean } = {},
  ) {
    super(message);
    this.code = options.code ?? "http_error";
    this.details = options.details;
    this.expose = options.expose ?? statusCode < 500;
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

export const isHttpError = (error: unknown): error is HttpError => error instanceof HttpError;

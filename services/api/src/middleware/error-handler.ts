import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

import { env } from "../config/env";
import { HttpError, isHttpError } from "../lib/http-error";
import { logger } from "../lib/logger";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    new HttpError(404, `Route ${req.method} ${req.originalUrl} not found.`, { code: "not_found" }),
  );
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const normalizedError =
    error instanceof ZodError
      ? new HttpError(400, "Invalid request input.", {
          code: "validation_error",
          details: error.flatten(),
        })
      : error;

  const statusCode = isHttpError(normalizedError) ? normalizedError.statusCode : 500;
  const message =
    isHttpError(normalizedError) && normalizedError.expose
      ? normalizedError.message
      : "Internal server error.";

  if (statusCode >= 500) {
    logger.error({ error: normalizedError, path: req.originalUrl }, "request failed");
  }

  res.status(statusCode).json({
    error: {
      code: isHttpError(normalizedError) ? normalizedError.code : "internal_error",
      details: isHttpError(normalizedError) ? normalizedError.details : undefined,
      message,
      stack: env.NODE_ENV === "development" ? (normalizedError as Error).stack : undefined,
    },
  });
};

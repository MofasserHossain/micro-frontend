import helmet from "helmet";
import type { NextFunction, Request, RequestHandler, Response } from "express";

import { env } from "../config/env";
import { HttpError } from "../lib/http-error";

const stateChangingMethods = new Set(["DELETE", "PATCH", "POST", "PUT"]);
const allowedOrigins = new Set(env.corsOrigins);

const safeRefererOrigin = (referer: string) => {
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
};

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      connectSrc: ["'self'"],
      defaultSrc: ["'self'"],
      frameAncestors: ["'none'"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  frameguard: { action: "deny" },
  hsts: {
    includeSubDomains: true,
    maxAge: 31536000,
    preload: true,
  },
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xXssProtection: false,
});

export const validateRequestSize =
  (maxBytes: number): RequestHandler =>
  (req, _res, next) => {
    const contentLength = Number.parseInt(req.headers["content-length"] ?? "0", 10);

    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      next(
        new HttpError(413, `Request size exceeds ${maxBytes} bytes.`, {
          code: "payload_too_large",
        }),
      );
      return;
    }

    next();
  };

export const validateContentType =
  (allowedTypes = ["application/json"]): RequestHandler =>
  (req, _res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      next();
      return;
    }

    const contentLength = Number.parseInt(req.headers["content-length"] ?? "0", 10);
    const contentType = req.headers["content-type"];

    if (contentLength === 0 && !contentType) {
      next();
      return;
    }

    if (!contentType || !allowedTypes.some((type) => contentType.includes(type))) {
      next(
        new HttpError(415, `Content-Type must be one of: ${allowedTypes.join(", ")}.`, {
          code: "unsupported_media_type",
        }),
      );
      return;
    }

    next();
  };

export const validateOrigin = (req: Request, _res: Response, next: NextFunction) => {
  if (!stateChangingMethods.has(req.method)) {
    next();
    return;
  }

  const fetchSite = req.headers["sec-fetch-site"];
  if (typeof fetchSite === "string") {
    if (fetchSite === "same-origin" || fetchSite === "same-site") {
      next();
      return;
    }

    next(new HttpError(403, "Cross-site request rejected.", { code: "origin_rejected" }));
    return;
  }

  const origin = req.headers.origin;
  if (typeof origin === "string") {
    if (allowedOrigins.has(origin)) {
      next();
      return;
    }

    next(new HttpError(403, "Origin is not allowed.", { code: "origin_rejected" }));
    return;
  }

  const referer = req.headers.referer;
  if (typeof referer === "string") {
    const refererOrigin = safeRefererOrigin(referer);

    if (refererOrigin && allowedOrigins.has(refererOrigin)) {
      next();
      return;
    }

    next(new HttpError(403, "Referer is not allowed.", { code: "origin_rejected" }));
    return;
  }

  if (env.isProduction) {
    next(new HttpError(403, "Origin verification is required.", { code: "origin_required" }));
    return;
  }

  next();
};

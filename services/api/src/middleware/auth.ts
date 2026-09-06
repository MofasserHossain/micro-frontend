import type { AuthPermission } from "@ecommerce-mf/types";
import type { Request, RequestHandler } from "express";

import { env } from "../config/env";
import { HttpError } from "../lib/http-error";
import {
  AUTH_CSRF_HEADER_NAME,
  getSessionByToken,
  isAuthorized,
} from "../modules/auth/auth.service";

const unsafeMethods = new Set(["DELETE", "PATCH", "POST", "PUT"]);

export const readSessionToken = (req: Request) => {
  const cookies = req.cookies as Record<string, string | undefined> | undefined;

  return cookies?.[env.SESSION_COOKIE_NAME];
};

export const attachOptionalAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = readSessionToken(req);
    const session = await getSessionByToken(token);

    if (session && token) {
      req.auth = session;
      req.sessionToken = token;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = readSessionToken(req);
    const session = await getSessionByToken(token);

    if (!session) {
      next(new HttpError(401, "Authentication is required.", { code: "unauthenticated" }));
      return;
    }

    req.auth = session;
    req.sessionToken = token;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireCsrf: RequestHandler = (req, _res, next) => {
  if (!unsafeMethods.has(req.method)) {
    next();
    return;
  }

  const submittedToken = req.header(AUTH_CSRF_HEADER_NAME);

  if (!req.auth) {
    next();
    return;
  }

  if (submittedToken !== req.auth.csrfToken) {
    next(new HttpError(403, "CSRF token is invalid or missing.", { code: "invalid_csrf" }));
    return;
  }

  next();
};

export const requirePermission =
  (permission: AuthPermission): RequestHandler =>
  (req, _res, next) => {
    if (!isAuthorized(req.auth, permission)) {
      next(new HttpError(403, "This account cannot access this resource.", { code: "forbidden" }));
      return;
    }

    next();
  };

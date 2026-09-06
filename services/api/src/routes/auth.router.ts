import { Router } from "express";
import { z } from "zod";

import { env } from "../config/env";
import { asyncHandler } from "../lib/async-handler";
import { readSessionToken, requireAuth, requireCsrf } from "../middleware/auth";
import { validateRequest } from "../middleware/validate-request";
import {
  authenticateUser,
  createSession,
  deleteSession,
  getClearSessionCookieOptions,
  getSessionByToken,
  getSessionCookieOptions,
  registerCustomer,
} from "../modules/auth/auth.service";

const registerSchema = z.object({
  email: z
    .string()
    .email()
    .transform((email) => email.toLowerCase()),
  fullName: z.string().trim().min(2).max(120),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z
    .string()
    .email()
    .transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128),
});

export const authRouter = Router();

authRouter.post(
  "/register",
  validateRequest({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const user = await registerCustomer(req.body);

    res.status(201).json({ data: { user } });
  }),
);

authRouter.post(
  "/login",
  validateRequest({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const user = await authenticateUser(req.body.email, req.body.password);
    const session = await createSession(user);

    res.cookie(env.SESSION_COOKIE_NAME, session.token, getSessionCookieOptions());
    res.json({
      data: {
        session: {
          csrfToken: session.csrfToken,
          expiresAt: session.expiresAt,
          user: session.user,
        },
      },
    });
  }),
);

authRouter.get(
  "/session",
  asyncHandler(async (req, res) => {
    res.json({
      data: {
        session: await getSessionByToken(readSessionToken(req)),
      },
    });
  }),
);

authRouter.post(
  "/logout",
  requireAuth,
  requireCsrf,
  asyncHandler(async (req, res) => {
    await deleteSession(req.sessionToken);
    res.clearCookie(env.SESSION_COOKIE_NAME, getClearSessionCookieOptions());
    res.status(204).send();
  }),
);

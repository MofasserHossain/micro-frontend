import type { AuthPermission, AuthRole, AuthSession, AuthUser } from "@ecommerce-mf/types";
import { eq, lt } from "drizzle-orm";
import type { CookieOptions } from "express";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { env } from "../../config/env";
import { db } from "../../db/client";
import { authSessions, users, type UserRecord } from "../../db/schema";
import { HttpError } from "../../lib/http-error";

export const AUTH_CSRF_HEADER_NAME = "X-CSRF-Token";

const scrypt = promisify(scryptCallback);
const passwordKeyLength = 64;
const sessionTtlMs = 1000 * 60 * 60 * 8;

type SessionRecord = AuthSession & {
  createdAt: string;
  token: string;
};

const rolePermissions: Record<AuthRole, AuthPermission[]> = {
  admin: [
    "account:read",
    "addresses:manage",
    "checkout:create",
    "orders:manage",
    "orders:read",
    "products:manage",
  ],
  customer: ["account:read", "addresses:manage", "checkout:create", "orders:read"],
};

const roleValues = new Set<AuthRole>(["admin", "customer"]);

const seedUsers = [
  {
    email: "admin@clothlane.com",
    fullName: "Clothlane Admin",
    password: "password123",
    phone: "+8801700000002",
    roles: ["admin", "customer"] satisfies AuthRole[],
  },
  {
    email: "customer@clothlane.com",
    fullName: "Demo Customer",
    password: "password123",
    phone: "+8801700000000",
    roles: ["customer"] satisfies AuthRole[],
  },
];

let seedPromise: Promise<void> | undefined;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const normalizeRoles = (roles: readonly string[]): AuthRole[] => {
  const normalizedRoles = roles.filter((role): role is AuthRole =>
    roleValues.has(role as AuthRole),
  );

  return normalizedRoles.length > 0 ? normalizedRoles : ["customer"];
};

const getRolePermissions = (roles: readonly AuthRole[]) => {
  const permissions = new Set<AuthPermission>();

  for (const role of roles) {
    for (const permission of rolePermissions[role]) {
      permissions.add(permission);
    }
  }

  return [...permissions];
};

const toAuthUser = (user: UserRecord): AuthUser => {
  const roles = normalizeRoles(user.roles);

  return {
    email: user.email,
    fullName: user.fullName,
    id: user.id,
    permissions: getRolePermissions(roles),
    phone: user.phone ?? undefined,
    roles,
  };
};

const toPublicSession = ({
  csrfToken,
  expiresAt,
  user,
}: {
  csrfToken: string;
  expiresAt: Date;
  user: UserRecord;
}): AuthSession => ({
  csrfToken,
  expiresAt: expiresAt.toISOString(),
  user: toAuthUser(user),
});

const getStableUserId = (email: string) => {
  let hash = 0;

  for (const character of email) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return `user_${hash.toString(36)}`;
};

const hashValue = (value: string) => createHash("sha256").update(value).digest("hex");

const getRandomToken = () => randomBytes(32).toString("base64url");

const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, passwordKeyLength)) as Buffer;

  return `scrypt:${salt}:${hash.toString("hex")}`;
};

const verifyPassword = async (password: string, storedHash: string) => {
  const [algorithm, salt, hash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;

  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

const ensureSeedUsers = () => {
  seedPromise ??= Promise.all(
    seedUsers.map(async (seedUser) => {
      const email = normalizeEmail(seedUser.email);

      await db
        .insert(users)
        .values({
          email,
          fullName: seedUser.fullName,
          id: getStableUserId(email),
          passwordHash: await hashPassword(seedUser.password),
          phone: seedUser.phone,
          roles: seedUser.roles,
        })
        .onConflictDoNothing({ target: users.email });
    }),
  ).then(() => undefined);

  return seedPromise;
};

export const initializeAuthData = ensureSeedUsers;

export const getSessionCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  maxAge: sessionTtlMs,
  path: "/",
  sameSite: "lax",
  secure: env.isProduction,
});

export const getClearSessionCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: env.isProduction,
});

export const registerCustomer = async ({
  email,
  fullName,
  password,
}: {
  email: string;
  fullName: string;
  password: string;
}) => {
  await ensureSeedUsers();

  const normalizedEmail = normalizeEmail(email);
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingUser) {
    throw new HttpError(409, "An account already exists for this email.", {
      code: "account_exists",
    });
  }

  const [user] = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      fullName: fullName.trim(),
      id: getStableUserId(normalizedEmail),
      passwordHash: await hashPassword(password),
      roles: ["customer"],
    })
    .returning();

  if (!user) {
    throw new HttpError(500, "Could not create account.", { code: "account_create_failed" });
  }

  return toAuthUser(user);
};

export const authenticateUser = async (email: string, password: string) => {
  await ensureSeedUsers();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(401, "Invalid email or password.", {
      code: "invalid_credentials",
    });
  }

  return toAuthUser(user);
};

export const createSession = async (user: AuthUser): Promise<SessionRecord> => {
  await db.delete(authSessions).where(lt(authSessions.expiresAt, new Date()));

  const token = getRandomToken();
  const csrfToken = getRandomToken();
  const expiresAt = new Date(Date.now() + sessionTtlMs);
  const [session] = await db
    .insert(authSessions)
    .values({
      csrfToken,
      expiresAt,
      tokenHash: hashValue(token),
      userId: user.id,
    })
    .returning();

  if (!session) {
    throw new HttpError(500, "Could not create session.", { code: "session_create_failed" });
  }

  return {
    createdAt: session.createdAt.toISOString(),
    csrfToken,
    expiresAt: session.expiresAt.toISOString(),
    token,
    user,
  };
};

export const getSessionByToken = async (token?: string): Promise<AuthSession | null> => {
  if (!token) {
    return null;
  }

  const [sessionRow] = await db
    .select({
      session: authSessions,
      user: users,
    })
    .from(authSessions)
    .innerJoin(users, eq(authSessions.userId, users.id))
    .where(eq(authSessions.tokenHash, hashValue(token)))
    .limit(1);

  if (!sessionRow) {
    return null;
  }

  if (sessionRow.session.expiresAt.getTime() <= Date.now()) {
    await db.delete(authSessions).where(eq(authSessions.id, sessionRow.session.id));
    return null;
  }

  await db
    .update(authSessions)
    .set({ lastSeenAt: new Date() })
    .where(eq(authSessions.id, sessionRow.session.id));

  return toPublicSession({
    csrfToken: sessionRow.session.csrfToken,
    expiresAt: sessionRow.session.expiresAt,
    user: sessionRow.user,
  });
};

export const deleteSession = async (token?: string) => {
  if (token) {
    await db.delete(authSessions).where(eq(authSessions.tokenHash, hashValue(token)));
  }
};

export const isAuthorized = (session: AuthSession | null | undefined, permission: AuthPermission) =>
  Boolean(session?.user.permissions.includes(permission));

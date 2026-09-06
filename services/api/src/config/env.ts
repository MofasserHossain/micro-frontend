import "dotenv/config";

import { z } from "zod";

const defaultDevSecret = "dev-only-secret-change-before-production";
const defaultDevDatabaseUrl = "postgresql://postgres:postgres@localhost:55018/ecommerce";

const envSchema = z
  .object({
    APP_ENV: z.enum(["local", "development", "staging", "production", "test"]).default("local"),
    CORS_ORIGIN: z.string().default("http://localhost:55010"),
    DATABASE_URL: z.string().min(1).default(defaultDevDatabaseUrl),
    DB_POOL_MAX: z.coerce.number().int().positive().default(10),
    DIRECT_URL: z.string().optional(),
    HOST: z.string().default("localhost"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    SESSION_COOKIE_NAME: z.string().min(1).default("ecommerce_dev_session"),
    SESSION_SECRET: z.string().min(32).default(defaultDevSecret),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV === "production" && value.SESSION_SECRET === defaultDevSecret) {
      context.addIssue({
        code: "custom",
        message: "SESSION_SECRET must be set in production.",
        path: ["SESSION_SECRET"],
      });
    }

    if (value.NODE_ENV === "production" && value.DATABASE_URL === defaultDevDatabaseUrl) {
      context.addIssue({
        code: "custom",
        message: "DATABASE_URL must be set in production.",
        path: ["DATABASE_URL"],
      });
    }

    if (value.NODE_ENV === "production" && !value.SESSION_COOKIE_NAME.startsWith("__Host-")) {
      context.addIssue({
        code: "custom",
        message: "Use a __Host- cookie name in production.",
        path: ["SESSION_COOKIE_NAME"],
      });
    }
  });

const parsedEnv = envSchema.parse(process.env);

const corsOrigins = parsedEnv.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  ...parsedEnv,
  corsOrigins,
  isProduction: parsedEnv.NODE_ENV === "production",
};

import "dotenv/config";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:55018/ecommerce",
  },
  dialect: "postgresql",
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
  strict: true,
  verbose: true,
});

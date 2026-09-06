import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "../config/env";
import * as schema from "./schema";

const queryClient = postgres(env.DATABASE_URL, {
  max: env.DB_POOL_MAX,
  prepare: false,
});

export const db = drizzle(queryClient, {
  logger: false,
  schema,
});

export const checkDatabaseConnection = async () => {
  await db.execute(sql`select 1`);
};

export const closeDatabase = async () => {
  await queryClient.end({ timeout: 5 });
};

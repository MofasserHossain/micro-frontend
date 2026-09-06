import { Router } from "express";

import { checkDatabaseConnection } from "../db/client";
import { asyncHandler } from "../lib/async-handler";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    data: {
      service: "ecommerce-api",
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

healthRouter.get(
  "/ready",
  asyncHandler(async (_req, res) => {
    await checkDatabaseConnection();

    res.json({
      data: {
        database: "connected",
        status: "ready",
      },
    });
  }),
);

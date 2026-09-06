import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import pinoHttp from "pino-http";

import { env } from "./config/env";
import { logger } from "./lib/logger";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import {
  securityHeaders,
  validateContentType,
  validateOrigin,
  validateRequestSize,
} from "./middleware/security";
import { apiRouter } from "./routes";

const createApp = () => {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(securityHeaders);
  app.use(
    cors({
      allowedHeaders: ["Accept", "Content-Type", "X-CSRF-Token"],
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      origin: env.corsOrigins.length > 0 ? env.corsOrigins : false,
    }),
  );
  app.use(validateOrigin);
  app.use(validateRequestSize(1024 * 1024));
  app.use(validateContentType());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser(env.SESSION_SECRET));
  app.use(pinoHttp({ logger }));

  app.get("/", (_req, res) => {
    res.json({
      data: {
        name: "ecommerce-api",
        status: "ok",
      },
    });
  });

  app.use("/api/v1", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export const app = createApp();

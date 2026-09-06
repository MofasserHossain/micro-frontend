import { env } from "./config/env";
import { checkDatabaseConnection, closeDatabase } from "./db/client";
import { logger } from "./lib/logger";
import { initializeAuthData } from "./modules/auth/auth.service";
import { initializeCatalogData } from "./modules/catalog/catalog.repository";
import { app } from "./server";

const startServer = async () => {
  await checkDatabaseConnection();
  await initializeAuthData();
  await initializeCatalogData();

  const server = app.listen(env.PORT, env.HOST, () => {
    logger.info(`API server running at http://${env.HOST}:${env.PORT}`);
  });

  let isShuttingDown = false;
  const shutdown = async (signal: NodeJS.Signals) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    logger.info({ signal }, "shutdown signal received");

    const forceExitTimer = setTimeout(() => process.exit(1), 10_000);
    forceExitTimer.unref();

    try {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
      await closeDatabase();
      clearTimeout(forceExitTimer);
      logger.info("API server and database connections closed");
      process.exit(0);
    } catch (error) {
      logger.error({ error }, "graceful shutdown failed");
      process.exit(1);
    }
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
};

process.on("uncaughtException", (error) => {
  logger.fatal({ error }, "uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "unhandled rejection");
});

void startServer().catch((error) => {
  logger.fatal({ error }, "failed to start API server");
  process.exit(1);
});

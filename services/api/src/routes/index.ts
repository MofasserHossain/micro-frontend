import { Router } from "express";

import { accountRouter } from "./account.router";
import { adminRouter } from "./admin.router";
import { authRouter } from "./auth.router";
import { catalogRouter } from "./catalog.router";
import { healthRouter } from "./health.router";
import { ordersRouter } from "./orders.router";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/catalog", catalogRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/account", accountRouter);
apiRouter.use("/admin", adminRouter);

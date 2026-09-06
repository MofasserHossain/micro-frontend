import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../lib/async-handler";
import { HttpError } from "../lib/http-error";
import { getStringParam } from "../lib/request";
import {
  attachOptionalAuth,
  requireAuth,
  requireCsrf,
  requirePermission,
} from "../middleware/auth";
import { validateRequest } from "../middleware/validate-request";
import { createOrder, findOrderById, listOrders } from "../modules/orders/orders.repository";

const deliveryZones = ["inside_dhaka", "outside_dhaka"] as const;

const cartItemSchema = z.object({
  color: z.string().trim().min(1),
  imageUrl: z.string().url(),
  name: z.string().trim().min(1),
  price: z.number().nonnegative(),
  productId: z.string().trim().min(1),
  quantity: z.number().int().positive(),
  size: z.string().trim().min(1),
  slug: z.string().trim().min(1),
});

const checkoutSchema = z.object({
  address: z.string().trim().min(5),
  addressLabel: z.string().trim().optional(),
  city: z.string().trim().min(2),
  customerName: z.string().trim().min(2),
  deliveryZone: z.enum(deliveryZones),
  email: z.string().email(),
  items: z.array(cartItemSchema).min(1),
  phone: z.string().trim().min(8),
  saveAddress: z.boolean().optional(),
});

const orderParamsSchema = z.object({
  orderId: z.string().trim().min(1),
});

export const ordersRouter = Router();

ordersRouter.get(
  "/",
  requireAuth,
  requirePermission("orders:read"),
  asyncHandler(async (req, res) => {
    res.json({
      data: {
        orders: await listOrders({ userId: req.auth?.user.id }),
      },
    });
  }),
);

ordersRouter.post(
  "/",
  attachOptionalAuth,
  requireCsrf,
  validateRequest({ body: checkoutSchema }),
  asyncHandler(async (req, res) => {
    const order = await createOrder({
      ...req.body,
      email: req.auth?.user.email ?? req.body.email,
      saveAddress: req.body.saveAddress,
      userId: req.auth?.user.id,
    });

    res.status(201).json({ data: { order } });
  }),
);

ordersRouter.get(
  "/:orderId",
  attachOptionalAuth,
  validateRequest({ params: orderParamsSchema }),
  asyncHandler(async (req, res, next) => {
    const orderId = getStringParam(req.params.orderId, "orderId");
    const order = await findOrderById(orderId);
    const canViewOrder =
      order &&
      (!order.userId ||
        order.userId === req.auth?.user.id ||
        Boolean(req.auth?.user.permissions.includes("orders:manage")));

    if (!canViewOrder) {
      next(new HttpError(404, "Order not found.", { code: "order_not_found" }));
      return;
    }

    res.json({ data: { order } });
  }),
);

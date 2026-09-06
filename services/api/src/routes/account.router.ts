import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../lib/async-handler";
import { HttpError } from "../lib/http-error";
import { requireAuth, requireCsrf, requirePermission } from "../middleware/auth";
import { validateRequest } from "../middleware/validate-request";
import {
  createCustomerAddress,
  getProfile,
  listCustomerAddresses,
} from "../modules/account/account.repository";

const deliveryZones = ["inside_dhaka", "outside_dhaka"] as const;

const addressSchema = z.object({
  address: z.string().trim().min(5),
  city: z.string().trim().min(2),
  deliveryZone: z.enum(deliveryZones),
  isDefault: z.boolean().optional(),
  label: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(8),
  recipientName: z.string().trim().min(2),
});

export const accountRouter = Router();

accountRouter.use(requireAuth);

accountRouter.get(
  "/profile",
  requirePermission("account:read"),
  asyncHandler(async (req, res, next) => {
    const profile = req.auth ? await getProfile(req.auth.user.id) : null;

    if (!profile) {
      next(new HttpError(404, "Profile not found.", { code: "profile_not_found" }));
      return;
    }

    res.json({ data: { profile } });
  }),
);

accountRouter.get(
  "/addresses",
  requirePermission("addresses:manage"),
  asyncHandler(async (req, res) => {
    res.json({
      data: {
        addresses: req.auth ? await listCustomerAddresses(req.auth.user.id) : [],
      },
    });
  }),
);

accountRouter.post(
  "/addresses",
  requirePermission("addresses:manage"),
  requireCsrf,
  validateRequest({ body: addressSchema }),
  asyncHandler(async (req, res) => {
    const address = req.auth ? await createCustomerAddress(req.auth.user.id, req.body) : null;

    res.status(201).json({ data: { address } });
  }),
);

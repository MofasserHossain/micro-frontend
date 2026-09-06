import type { OrderStatus, ProductCategory } from "@ecommerce-mf/types";
import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../lib/async-handler";
import { HttpError } from "../lib/http-error";
import { getStringParam } from "../lib/request";
import { requireAuth, requireCsrf, requirePermission } from "../middleware/auth";
import { getValidatedQuery, validateRequest } from "../middleware/validate-request";
import { listCustomers } from "../modules/account/account.repository";
import {
  createProduct,
  listProducts,
  updateProductStatus,
} from "../modules/catalog/catalog.repository";
import { findOrderById, listOrders, updateOrderStatus } from "../modules/orders/orders.repository";

const productCategories = [
  "Accessories",
  "Dresses",
  "Hoodies",
  "Jackets",
  "Jeans",
  "Shirts",
  "T-Shirts",
] as const;

const orderStatuses = ["cancelled", "confirmed", "delivered", "pending", "shipped"] as const;
const orderStatusFilters = [...orderStatuses, "all"] as const;

const createProductSchema = z.object({
  active: z.boolean().default(true),
  category: z.enum(productCategories),
  colors: z.array(z.string().trim().min(1)).min(1),
  description: z.string().trim().min(10),
  featured: z.boolean().optional(),
  imageUrl: z.string().url(),
  name: z.string().trim().min(2).max(160),
  price: z.number().nonnegative(),
  sizes: z.array(z.string().trim().min(1)).min(1),
  stock: z.number().int().nonnegative(),
});

const productStatusSchema = z.object({
  active: z.boolean(),
});

const productsQuerySchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(["active", "all", "archived"]).optional(),
});

const ordersQuerySchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(orderStatusFilters).optional(),
});

const customersQuerySchema = z.object({
  query: z.string().trim().optional(),
});

type CustomersQuery = z.infer<typeof customersQuerySchema>;
type OrdersQuery = z.infer<typeof ordersQuerySchema>;
type ProductsQuery = z.infer<typeof productsQuerySchema>;

const orderStatusSchema = z.object({
  status: z.enum(orderStatuses),
});

const productParamsSchema = z.object({
  productId: z.string().trim().min(1),
});

const orderParamsSchema = z.object({
  orderId: z.string().trim().min(1),
});

export const adminRouter = Router();

adminRouter.use(requireAuth);

adminRouter.get(
  "/summary",
  requirePermission("orders:manage"),
  asyncHandler(async (_req, res) => {
    const products = await listProducts({ includeInactive: true });
    const orders = await listOrders();
    const customers = await listCustomers();

    res.json({
      data: {
        activeProducts: products.filter((product) => product.active).length,
        customersTotal: customers.length,
        ordersTotal: orders.length,
        productsTotal: products.length,
        revenue: orders.reduce((total, order) => total + order.total, 0),
      },
    });
  }),
);

adminRouter.get(
  "/products",
  requirePermission("products:manage"),
  validateRequest({ query: productsQuerySchema }),
  asyncHandler(async (req, res) => {
    const query = getValidatedQuery<ProductsQuery>(res);

    res.json({
      data: {
        products: await listProducts({
          includeInactive: true,
          query: query.query,
          status: query.status ?? "all",
        }),
      },
    });
  }),
);

adminRouter.post(
  "/products",
  requirePermission("products:manage"),
  requireCsrf,
  validateRequest({ body: createProductSchema }),
  asyncHandler(async (req, res) => {
    const product = await createProduct({
      ...req.body,
      category: req.body.category as ProductCategory,
    });

    res.status(201).json({ data: { product } });
  }),
);

adminRouter.patch(
  "/products/:productId/status",
  requirePermission("products:manage"),
  requireCsrf,
  validateRequest({ body: productStatusSchema, params: productParamsSchema }),
  asyncHandler(async (req, res, next) => {
    const productId = getStringParam(req.params.productId, "productId");
    const product = await updateProductStatus(productId, req.body.active);

    if (!product) {
      next(new HttpError(404, "Product not found.", { code: "product_not_found" }));
      return;
    }

    res.json({ data: { product } });
  }),
);

adminRouter.get(
  "/orders",
  requirePermission("orders:manage"),
  validateRequest({ query: ordersQuerySchema }),
  asyncHandler(async (req, res) => {
    const query = getValidatedQuery<OrdersQuery>(res);

    res.json({
      data: {
        orders: await listOrders({
          query: query.query,
          status: query.status ?? "all",
        }),
      },
    });
  }),
);

adminRouter.get(
  "/orders/:orderId",
  requirePermission("orders:manage"),
  validateRequest({ params: orderParamsSchema }),
  asyncHandler(async (req, res, next) => {
    const orderId = getStringParam(req.params.orderId, "orderId");
    const order = await findOrderById(orderId);

    if (!order) {
      next(new HttpError(404, "Order not found.", { code: "order_not_found" }));
      return;
    }

    res.json({ data: { order } });
  }),
);

adminRouter.patch(
  "/orders/:orderId/status",
  requirePermission("orders:manage"),
  requireCsrf,
  validateRequest({ body: orderStatusSchema, params: orderParamsSchema }),
  asyncHandler(async (req, res, next) => {
    const orderId = getStringParam(req.params.orderId, "orderId");
    const order = await updateOrderStatus(orderId, req.body.status as OrderStatus);

    if (!order) {
      next(new HttpError(404, "Order not found.", { code: "order_not_found" }));
      return;
    }

    res.json({ data: { order } });
  }),
);

adminRouter.get(
  "/customers",
  requirePermission("orders:manage"),
  validateRequest({ query: customersQuerySchema }),
  asyncHandler(async (req, res) => {
    const query = getValidatedQuery<CustomersQuery>(res);

    res.json({
      data: {
        customers: await listCustomers(query.query),
      },
    });
  }),
);

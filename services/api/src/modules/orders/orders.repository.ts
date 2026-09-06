import type { CartItem, DeliveryZone, Order, OrderStatus } from "@ecommerce-mf/types";
import { eq, inArray, sql } from "drizzle-orm";
import { randomBytes } from "node:crypto";

import { db } from "../../db/client";
import {
  customerAddresses,
  orderItems,
  orders,
  products,
  type OrderItemRecord,
  type OrderRecord,
} from "../../db/schema";
import { HttpError } from "../../lib/http-error";
import { initializeCatalogData } from "../catalog/catalog.repository";

const deliveryFees: Record<DeliveryZone, number> = {
  inside_dhaka: 60,
  outside_dhaka: 200,
};

const createOrderId = () =>
  `ORD-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

const toOrder = (order: OrderRecord, items: OrderItemRecord[]): Order => ({
  address: order.address,
  city: order.city,
  createdAt: order.createdAt.toISOString(),
  customerName: order.customerName,
  deliveryFee: order.deliveryFee,
  deliveryZone: order.deliveryZone,
  email: order.email,
  id: order.id,
  items: items.map((item) => ({
    color: item.color,
    id: item.id,
    imageUrl: item.imageUrl ?? undefined,
    lineTotal: item.lineTotal,
    productId: item.productId ?? undefined,
    productName: item.productName,
    productSlug: item.productSlug ?? undefined,
    quantity: item.quantity,
    size: item.size,
    unitPrice: item.unitPrice,
  })),
  itemsSubtotal: order.itemsSubtotal,
  paymentMethod: "cash_on_delivery",
  phone: order.phone,
  status: order.status,
  total: order.total,
  userId: order.userId,
});

const loadItemsForOrders = async (orderIds: string[]) => {
  if (orderIds.length === 0) {
    return new Map<string, OrderItemRecord[]>();
  }

  const itemRows = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));
  const itemsByOrderId = new Map<string, OrderItemRecord[]>();

  for (const item of itemRows) {
    itemsByOrderId.set(item.orderId, [...(itemsByOrderId.get(item.orderId) ?? []), item]);
  }

  return itemsByOrderId;
};

const hydrateOrders = async (orderRows: OrderRecord[]) => {
  const itemsByOrderId = await loadItemsForOrders(orderRows.map((order) => order.id));

  return orderRows
    .map((order) => toOrder(order, itemsByOrderId.get(order.id) ?? []))
    .toSorted((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
};

export const listOrders = async ({
  query,
  status = "all",
  userId,
}: {
  query?: string;
  status?: OrderStatus | "all";
  userId?: string;
} = {}) => {
  const normalizedQuery = query?.trim().toLowerCase();
  const orderRows = await db.select().from(orders);
  const hydratedOrders = await hydrateOrders(orderRows);

  return hydratedOrders
    .filter((order) => !userId || order.userId === userId || order.email === userId)
    .filter((order) => status === "all" || order.status === status)
    .filter(
      (order) =>
        !normalizedQuery ||
        [order.id, order.customerName, order.email, order.phone]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
    );
};

export const findOrderById = async (orderId: string) => {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

  if (!order) {
    return null;
  }

  const [hydratedOrder] = await hydrateOrders([order]);

  return hydratedOrder ?? null;
};

export const createOrder = async ({
  address,
  addressLabel,
  city,
  customerName,
  deliveryZone,
  email,
  items,
  phone,
  saveAddress = false,
  userId,
}: {
  address: string;
  addressLabel?: string;
  city: string;
  customerName: string;
  deliveryZone: DeliveryZone;
  email: string;
  items: CartItem[];
  phone: string;
  saveAddress?: boolean;
  userId?: string | null;
}) => {
  await initializeCatalogData();

  return db.transaction(async (tx) => {
    const productIds = [...new Set(items.map((item) => item.productId))];
    const productRows = await tx.select().from(products).where(inArray(products.id, productIds));
    const productsById = new Map(productRows.map((product) => [product.id, product]));
    const quantitiesByProductId = new Map<string, number>();

    for (const item of items) {
      const product = productsById.get(item.productId);

      if (!product?.active) {
        throw new HttpError(400, `${item.name} is no longer available.`, {
          code: "product_unavailable",
        });
      }

      if (!product.sizes.includes(item.size)) {
        throw new HttpError(400, `${product.name} is not available in size ${item.size}.`, {
          code: "variant_unavailable",
        });
      }

      if (!product.colors.includes(item.color)) {
        throw new HttpError(400, `${product.name} is not available in ${item.color}.`, {
          code: "variant_unavailable",
        });
      }

      quantitiesByProductId.set(
        product.id,
        (quantitiesByProductId.get(product.id) ?? 0) + item.quantity,
      );
    }

    await Promise.all(
      [...quantitiesByProductId].map(([productId, quantity]) => {
        const product = productsById.get(productId);

        if (!product || product.stock < quantity) {
          throw new HttpError(400, `Only ${product?.stock ?? 0} items are in stock.`, {
            code: "insufficient_stock",
          });
        }

        return tx
          .update(products)
          .set({
            stock: sql`${products.stock} - ${quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, productId));
      }),
    );

    const preparedItems = items.map((item) => {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new HttpError(400, `${item.name} is no longer available.`, {
          code: "product_unavailable",
        });
      }

      return {
        color: item.color,
        imageUrl: product.imageUrl,
        lineTotal: product.price * item.quantity,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        quantity: item.quantity,
        size: item.size,
        unitPrice: product.price,
      };
    });
    const itemsSubtotal = preparedItems.reduce((total, item) => total + item.lineTotal, 0);
    const deliveryFee = deliveryFees[deliveryZone];
    const [order] = await tx
      .insert(orders)
      .values({
        address: address.trim(),
        city: city.trim(),
        customerName: customerName.trim(),
        deliveryFee,
        deliveryZone,
        email: email.trim().toLowerCase(),
        id: createOrderId(),
        itemsSubtotal,
        paymentMethod: "cash_on_delivery",
        phone: phone.trim(),
        status: "pending",
        total: itemsSubtotal + deliveryFee,
        userId: userId ?? null,
      })
      .returning();

    if (!order) {
      throw new HttpError(500, "Could not create order.", { code: "order_create_failed" });
    }

    const createdItems = await tx
      .insert(orderItems)
      .values(
        preparedItems.map((item) => ({
          color: item.color,
          imageUrl: item.imageUrl,
          lineTotal: item.lineTotal,
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          productSlug: item.productSlug,
          quantity: item.quantity,
          size: item.size,
          unitPrice: item.unitPrice,
        })),
      )
      .returning();

    if (saveAddress && userId) {
      const [existingAddress] = await tx
        .select({ id: customerAddresses.id })
        .from(customerAddresses)
        .where(eq(customerAddresses.userId, userId))
        .limit(1);

      await tx.insert(customerAddresses).values({
        address: address.trim(),
        city: city.trim(),
        deliveryZone,
        isDefault: !existingAddress,
        label: addressLabel?.trim() || "Home",
        phone: phone.trim(),
        recipientName: customerName.trim(),
        userId,
      });
    }

    return toOrder(order, createdItems);
  });
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const [order] = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();

  if (!order) {
    return null;
  }

  const [hydratedOrder] = await hydrateOrders([order]);

  return hydratedOrder ?? null;
};

import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";

export const productCategoryValues = [
  "Accessories",
  "Dresses",
  "Hoodies",
  "Jackets",
  "Jeans",
  "Shirts",
  "T-Shirts",
] as const;

export const deliveryZoneValues = ["inside_dhaka", "outside_dhaka"] as const;

export const orderStatusValues = [
  "cancelled",
  "confirmed",
  "delivered",
  "pending",
  "shipped",
] as const;

export const productCategoryEnum = pgEnum("product_category", productCategoryValues);
export const deliveryZoneEnum = pgEnum("delivery_zone", deliveryZoneValues);
export const orderStatusEnum = pgEnum("order_status", orderStatusValues);

export const users = pgTable(
  "users",
  {
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    email: varchar("email", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    id: varchar("id", { length: 64 })
      .primaryKey()
      .$defaultFn(() => `user_${randomUUID()}`),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    roles: text("roles")
      .array()
      .notNull()
      .default(sql`ARRAY['customer']::text[]`),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("users_created_at_idx").on(table.createdAt),
    uniqueIndex("users_email_unique").on(table.email),
  ],
);

export const authSessions = pgTable(
  "auth_sessions",
  {
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    csrfToken: varchar("csrf_token", { length: 128 }).notNull(),
    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
    id: varchar("id", { length: 64 })
      .primaryKey()
      .$defaultFn(() => `session_${randomUUID()}`),
    lastSeenAt: timestamp("last_seen_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    userId: varchar("user_id", { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("auth_sessions_expires_at_idx").on(table.expiresAt),
    uniqueIndex("auth_sessions_token_hash_unique").on(table.tokenHash),
    index("auth_sessions_user_id_idx").on(table.userId),
  ],
);

export const products = pgTable(
  "products",
  {
    active: boolean("active").notNull().default(true),
    category: productCategoryEnum("category").notNull(),
    colors: text("colors")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    description: text("description").notNull(),
    featured: boolean("featured").notNull().default(false),
    id: varchar("id", { length: 64 })
      .primaryKey()
      .$defaultFn(() => `prod_${randomUUID()}`),
    imagePath: text("image_path"),
    imageUrl: text("image_url").notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    price: integer("price").notNull(),
    sizes: text("sizes")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    slug: varchar("slug", { length: 220 }).notNull(),
    sourceUrl: text("source_url"),
    stock: integer("stock").notNull().default(0),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("products_active_category_idx").on(table.active, table.category),
    index("products_created_at_idx").on(table.createdAt),
    uniqueIndex("products_slug_unique").on(table.slug),
  ],
);

export const customerAddresses = pgTable(
  "customer_addresses",
  {
    address: text("address").notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    deliveryZone: deliveryZoneEnum("delivery_zone").notNull(),
    id: varchar("id", { length: 64 })
      .primaryKey()
      .$defaultFn(() => `addr_${randomUUID()}`),
    isDefault: boolean("is_default").notNull().default(false),
    label: varchar("label", { length: 80 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    recipientName: varchar("recipient_name", { length: 160 }).notNull(),
    userId: varchar("user_id", { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("customer_addresses_created_at_idx").on(table.createdAt),
    index("customer_addresses_user_id_idx").on(table.userId),
  ],
);

export const orders = pgTable(
  "orders",
  {
    address: text("address").notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    customerName: varchar("customer_name", { length: 160 }).notNull(),
    deliveryFee: integer("delivery_fee").notNull(),
    deliveryZone: deliveryZoneEnum("delivery_zone").notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    id: varchar("id", { length: 64 }).primaryKey(),
    itemsSubtotal: integer("items_subtotal").notNull(),
    paymentMethod: varchar("payment_method", { length: 40 }).notNull().default("cash_on_delivery"),
    phone: varchar("phone", { length: 40 }).notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    total: integer("total").notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    userId: varchar("user_id", { length: 64 }).references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("orders_created_at_idx").on(table.createdAt),
    index("orders_status_idx").on(table.status),
    index("orders_user_id_idx").on(table.userId),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    color: varchar("color", { length: 80 }).notNull(),
    id: varchar("id", { length: 64 })
      .primaryKey()
      .$defaultFn(() => `item_${randomUUID()}`),
    imageUrl: text("image_url"),
    lineTotal: integer("line_total").notNull(),
    orderId: varchar("order_id", { length: 64 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 64 }).references(() => products.id, {
      onDelete: "set null",
    }),
    productName: varchar("product_name", { length: 180 }).notNull(),
    productSlug: varchar("product_slug", { length: 220 }),
    quantity: integer("quantity").notNull(),
    size: varchar("size", { length: 40 }).notNull(),
    unitPrice: integer("unit_price").notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    index("order_items_product_id_idx").on(table.productId),
  ],
);

export type AuthSessionRecord = typeof authSessions.$inferSelect;
export type CustomerAddressRecord = typeof customerAddresses.$inferSelect;
export type NewCustomerAddressRecord = typeof customerAddresses.$inferInsert;
export type NewOrderItemRecord = typeof orderItems.$inferInsert;
export type NewOrderRecord = typeof orders.$inferInsert;
export type NewProductRecord = typeof products.$inferInsert;
export type NewUserRecord = typeof users.$inferInsert;
export type OrderItemRecord = typeof orderItems.$inferSelect;
export type OrderRecord = typeof orders.$inferSelect;
export type ProductRecord = typeof products.$inferSelect;
export type UserRecord = typeof users.$inferSelect;

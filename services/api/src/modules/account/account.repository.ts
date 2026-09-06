import type { CustomerAddress, DeliveryZone, Profile } from "@ecommerce-mf/types";
import { eq } from "drizzle-orm";

import { db } from "../../db/client";
import {
  customerAddresses,
  orders,
  users,
  type CustomerAddressRecord,
  type UserRecord,
} from "../../db/schema";

export type AddressInput = {
  address: string;
  city: string;
  deliveryZone: DeliveryZone;
  isDefault?: boolean;
  label: string;
  phone: string;
  recipientName: string;
};

export type CustomerSummary = {
  email: string;
  fullName: string;
  lastOrderAt?: string;
  orders: number;
  phone?: string;
  totalSpent: number;
  userId?: string | null;
};

const toAddress = (address: CustomerAddressRecord): CustomerAddress => ({
  address: address.address,
  city: address.city,
  createdAt: address.createdAt.toISOString(),
  deliveryZone: address.deliveryZone,
  id: address.id,
  isDefault: address.isDefault,
  label: address.label,
  phone: address.phone,
  recipientName: address.recipientName,
  userId: address.userId,
});

const toProfile = (user: UserRecord): Profile => ({
  createdAt: user.createdAt.toISOString(),
  fullName: user.fullName,
  id: user.id,
  phone: user.phone,
  role: user.roles.includes("admin") ? "admin" : "customer",
});

export const getProfile = async (userId: string) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  return user ? toProfile(user) : null;
};

export const listCustomerAddresses = async (userId: string) => {
  const addresses = await db
    .select()
    .from(customerAddresses)
    .where(eq(customerAddresses.userId, userId));

  return addresses
    .map(toAddress)
    .toSorted((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
};

export const createCustomerAddress = async (userId: string, input: AddressInput) => {
  const existingAddresses = await listCustomerAddresses(userId);
  const isDefault = Boolean(input.isDefault) || existingAddresses.length === 0;

  if (isDefault) {
    await db
      .update(customerAddresses)
      .set({ isDefault: false })
      .where(eq(customerAddresses.userId, userId));
  }

  const [address] = await db
    .insert(customerAddresses)
    .values({
      address: input.address.trim(),
      city: input.city.trim(),
      deliveryZone: input.deliveryZone,
      isDefault,
      label: input.label.trim() || "Home",
      phone: input.phone.trim(),
      recipientName: input.recipientName.trim(),
      userId,
    })
    .returning();

  return address ? toAddress(address) : null;
};

export const listCustomers = async (query = "") => {
  const normalizedQuery = query.trim().toLowerCase();
  const userRows = await db.select().from(users);
  const orderRows = await db.select().from(orders);
  const customers = new Map<string, CustomerSummary>();

  for (const user of userRows) {
    if (!user.roles.includes("customer")) {
      continue;
    }

    customers.set(user.id, {
      email: user.email,
      fullName: user.fullName,
      orders: 0,
      phone: user.phone ?? undefined,
      totalSpent: 0,
      userId: user.id,
    });
  }

  for (const order of orderRows) {
    const key = order.userId ?? order.email;
    const current = customers.get(key);

    customers.set(key, {
      email: order.email,
      fullName: current?.fullName ?? order.customerName,
      lastOrderAt:
        current?.lastOrderAt && Date.parse(current.lastOrderAt) > order.createdAt.getTime()
          ? current.lastOrderAt
          : order.createdAt.toISOString(),
      orders: (current?.orders ?? 0) + 1,
      phone: current?.phone ?? order.phone,
      totalSpent: (current?.totalSpent ?? 0) + order.total,
      userId: order.userId,
    });
  }

  return [...customers.values()]
    .filter(
      (customer) =>
        !normalizedQuery ||
        [customer.fullName, customer.email, customer.phone ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
    )
    .toSorted(
      (first, second) => Date.parse(second.lastOrderAt ?? "") - Date.parse(first.lastOrderAt ?? ""),
    );
};

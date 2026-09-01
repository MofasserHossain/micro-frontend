import type { Money } from "@ecommerce-mf/types";

export function formatCurrency(value: Money | number, currency = "BDT") {
  const amount = typeof value === "number" ? value : value.amount;
  const currencyCode = typeof value === "number" ? currency : value.currency;

  return new Intl.NumberFormat(currencyCode === "BDT" ? "en-BD" : "en-US", {
    currency: currencyCode,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

import type { Money } from "@ecommerce-mf/types";

export function formatCurrency(money: Money) {
  return new Intl.NumberFormat("en-US", {
    currency: money.currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(money.amount);
}

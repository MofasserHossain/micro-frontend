import { PRODUCT_CATEGORIES } from "@ecommerce-mf/api";
import type { ProductSort } from "@ecommerce-mf/types";

export const catalogCategories = ["All", ...PRODUCT_CATEGORIES] as const;

export const productSortOptions: Array<[ProductSort, string]> = [
  ["featured", "Featured first"],
  ["newest", "Newest first"],
  ["price-asc", "Price low to high"],
  ["price-desc", "Price high to low"],
];

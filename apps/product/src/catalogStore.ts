import type { ProductCategory } from "@ecommerce-mf/types";
import { create } from "zustand";

export const catalogCategories = ["All", "Apparel", "Bags", "Footwear", "Home", "Tech"] as const;

type CatalogCategory = ProductCategory | "All";

type CatalogState = {
  category: CatalogCategory;
  search: string;
  setCategory: (category: CatalogCategory) => void;
  setSearch: (search: string) => void;
};

export const useCatalogStore = create<CatalogState>((set) => ({
  category: "All",
  search: "",
  setCategory: (category) => set({ category }),
  setSearch: (search) => set({ search }),
}));

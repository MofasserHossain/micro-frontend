import type { CartItem, Product } from "@ecommerce-mf/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartState = {
  addItem: (product: Product, quantity?: number) => void;
  clearCart: () => void;
  decrementItem: (productId: string) => void;
  items: CartItem[];
  removeItem: (productId: string) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id);

          if (!existingItem) {
            return {
              items: [...state.items, { product, quantity }],
            };
          }

          return {
            items: state.items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
          };
        });
      },
      clearCart: () => set({ items: [] }),
      decrementItem: (productId) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
            )
            .filter((item) => item.quantity > 0),
        }));
      },
      items: [],
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
    }),
    {
      name: "ecommerce-mf-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const selectCartCount = (state: CartState) =>
  state.items.reduce((count, item) => count + item.quantity, 0);

export const selectCartSubtotal = (state: CartState) =>
  state.items.reduce((total, item) => total + item.product.price.amount * item.quantity, 0);

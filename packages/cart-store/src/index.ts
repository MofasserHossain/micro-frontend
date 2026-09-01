import type { CartItem, Product } from "@ecommerce-mf/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartVariant = {
  color?: string;
  quantity?: number;
  size?: string;
};

export type CartState = {
  addItem: (product: Product, variant?: CartVariant) => void;
  clearCart: () => void;
  decrementItem: (lineId: string) => void;
  incrementItem: (lineId: string) => void;
  items: CartItem[];
  removeItem: (lineId: string) => void;
};

const getCartLineId = (item: Pick<CartItem, "color" | "productId" | "size">) =>
  `${item.productId}:${item.size}:${item.color}`;

const toCartItem = (product: Product, variant?: CartVariant): CartItem => ({
  color: variant?.color ?? product.colors[0] ?? "Default",
  imageUrl: product.imageUrl,
  name: product.name,
  price: product.price,
  productId: product.id,
  quantity: variant?.quantity ?? 1,
  size: variant?.size ?? product.sizes[0] ?? "One Size",
  slug: product.slug,
});

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      addItem: (product, variant) => {
        set((state) => {
          const nextItem = toCartItem(product, variant);
          const lineId = getCartLineId(nextItem);
          const existingItem = state.items.find((item) => getCartLineId(item) === lineId);

          if (!existingItem) {
            return {
              items: [...state.items, nextItem],
            };
          }

          return {
            items: state.items.map((item) =>
              getCartLineId(item) === lineId
                ? { ...item, quantity: item.quantity + nextItem.quantity }
                : item,
            ),
          };
        });
      },
      clearCart: () => set({ items: [] }),
      decrementItem: (lineId) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              getCartLineId(item) === lineId ? { ...item, quantity: item.quantity - 1 } : item,
            )
            .filter((item) => item.quantity > 0),
        }));
      },
      incrementItem: (lineId) => {
        set((state) => ({
          items: state.items.map((item) =>
            getCartLineId(item) === lineId ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }));
      },
      items: [],
      removeItem: (lineId) => {
        set((state) => ({
          items: state.items.filter((item) => getCartLineId(item) !== lineId),
        }));
      },
    }),
    {
      name: "clothlane-mf-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const getCartItemId = getCartLineId;

export const selectCartCount = (state: CartState) =>
  state.items.reduce((count, item) => count + item.quantity, 0);

export const selectCartSubtotal = (state: CartState) =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0);

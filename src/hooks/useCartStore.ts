import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateItem: (productId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  subtotal: () => number;
  deliveryFee: number;
  setDeliveryFee: (fee: number) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryFee: 1500,
      addItem: (item) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        if (existing) {
          set((s) => ({
            items: s.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity, estimatedTotal: i.estimatedTotal + item.estimatedTotal }
                : i
            ),
          }));
        } else {
          set((s) => ({ items: [...s.items, item] }));
        }
      },
      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      updateItem: (productId, updates) =>
        set((s) => ({
          items: s.items.map((i) => (i.productId === productId ? { ...i, ...updates } : i)),
        })),
      clearCart: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.estimatedTotal, 0),
      setDeliveryFee: (fee) => set({ deliveryFee: fee }),
    }),
    { name: "escama-cart" }
  )
);

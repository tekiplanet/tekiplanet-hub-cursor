import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types/store';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  cart: CartItem[];
  isHydrated: boolean;
  setHydrated: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      isHydrated: false,
      setHydrated: () => set({ isHydrated: true }),

      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.cart.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            cart: [...state.cart, { product, quantity }],
          };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ cart: [] });
      },

      getItemCount: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().cart.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
); 
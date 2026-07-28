import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GlobalOptionSelection {
  groupTitle: string;
  label: string;
  price: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  base_price?: number;
  quantity: number;
  primary_image?: string;
  brand?: string;
  sku?: string;
  selectedAttribute?: string;
  selectedGlobalOptions?: GlobalOptionSelection[];
}

interface CartStore {
  items: CartItem[];
  addItem: (
    product: any,
    quantity?: number,
    selectedAttribute?: string,
    selectedGlobalOptions?: GlobalOptionSelection[],
    calculatedPrice?: number
  ) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (
        product,
        quantity = 1,
        selectedAttribute = '',
        selectedGlobalOptions = [],
        calculatedPrice
      ) => {
        const currentItems = get().items;
        const baseP = Number(product.price) || 0;
        const optionsAddOnPrice = (selectedGlobalOptions || []).reduce((sum, opt) => sum + (Number(opt.price) || 0), 0);
        const finalUnitPrice = calculatedPrice !== undefined ? calculatedPrice : (baseP + optionsAddOnPrice);
        const optionsKey = JSON.stringify(selectedGlobalOptions || []);

        const existing = currentItems.find(
          (i) => i.product_id === product.id && i.selectedAttribute === selectedAttribute && JSON.stringify(i.selectedGlobalOptions || []) === optionsKey
        );

        if (existing) {
          set({
            items: currentItems.map((i) =>
              i.id === existing.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...currentItems,
              {
                id: Date.now() + Math.random(),
                product_id: product.id,
                name: product.name,
                price: finalUnitPrice,
                base_price: baseP,
                quantity,
                primary_image: product.primary_image,
                brand: product.brand,
                sku: product.sku,
                selectedAttribute,
                selectedGlobalOptions,
              },
            ],
          });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      updateQuantity: (id, delta) => {
        set({
          items: get().items
            .map((i) => {
              if (i.id === id) {
                const newQty = i.quantity + delta;
                return newQty > 0 ? { ...i, quantity: newQty } : null;
              }
              return i;
            })
            .filter(Boolean) as CartItem[],
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'bmg_cart_storage',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    category?: string;
    isVeg?: boolean;
    portion?: string;
}

interface CartStore {
    items: CartItem[];
    addItem: (product: any) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getSubtotal: () => number;
    getTax: () => number;
    getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product) => {
                set((state) => {
                    const existingItem = state.items.find((item) => item.id === product.id);
                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            ),
                        };
                    }
                    return { items: [...state.items, { ...product, quantity: 1 }] };
                });
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },

            updateQuantity: (id, delta) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id
                            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                            : item
                    ).filter(item => item.quantity > 0),
                }));
            },

            clearCart: () => set({ items: [] }),

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getSubtotal: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            getTax: () => {
                return get().getSubtotal() * 0.1;
            },

            getTotal: () => {
                return get().getSubtotal() + get().getTax();
            },
        }),
        {
            name: 'tbc-cart-storage',
        }
    )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartAddon {
    petpoojaId: string;
    name: string;
    price: number;
    groupId: string;
    groupName: string;
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    category?: string;
    isVeg?: boolean;
    portion?: string;
    addons?: CartAddon[];
}

interface CartStore {
    items: CartItem[];
    addItem: (product: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
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
                    const existing = state.items.find((item) => item.id === product.id);
                    if (existing) {
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
                    items: state.items
                        .map((item) =>
                            item.id === id
                                ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                                : item
                        )
                        .filter((item) => item.quantity > 0),
                }));
            },

            clearCart: () => set({ items: [] }),

            getTotalItems: () =>
                get().items.reduce((total, item) => total + item.quantity, 0),

            getSubtotal: () =>
                get().items.reduce((total, item) => {
                    const addonSum = (item.addons ?? []).reduce((s, a) => s + a.price, 0);
                    return total + (item.price + addonSum) * item.quantity;
                }, 0),

            getTax: () => get().getSubtotal() * 0.05,

            getTotal: () => get().getSubtotal() + get().getTax(),
        }),
        {
            name: 'tbc-cart-storage',
        }
    )
);

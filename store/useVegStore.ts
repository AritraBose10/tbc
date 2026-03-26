import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VegStore {
    isVeg: boolean;
    toggle: () => void;
}

export const useVegStore = create<VegStore>()(
    persist(
        (set) => ({
            isVeg: false,
            toggle: () => set((state) => ({ isVeg: !state.isVeg })),
        }),
        { name: 'tbc-veg-mode' }
    )
);

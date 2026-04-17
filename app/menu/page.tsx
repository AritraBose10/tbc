"use client";

import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useVegStore } from "@/store/useVegStore";

type LiveMenuVariant = { petpoojaId: string; name: string; price: number };

type LiveMenuItem = {
    petpoojaId:   string;
    name:         string;
    price:        number;
    categoryName: string;
    isVeg:        boolean;
    variants:     LiveMenuVariant[];
    addons:       { petpoojaId: string; name: string; price: number }[];
};

// An item is variant-only when the parent price is 0 and has variants.
// Petpooja expects the variant petpoojaId (not the parent) as the order item id.
const isVariantOnly = (item: LiveMenuItem) =>
    item.price === 0 && item.variants.length > 0;

function MenuContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category");

    const [searchQuery, setSearchQuery]         = useState("");
    const [activeCategory, setActiveCategory]   = useState("All");
    const [hydrated, setHydrated]               = useState(false);
    const [menuItems, setMenuItems]             = useState<LiveMenuItem[]>([]);
    const [loading, setLoading]                 = useState(true);
    const [variantPickerItem, setVariantPickerItem] = useState<LiveMenuItem | null>(null);

    const { items: cartItems, addItem, updateQuantity } = useCartStore();
    const { isVeg: isVegOnly } = useVegStore();

    useEffect(() => {
        setHydrated(true);
        if (categoryParam) setActiveCategory(categoryParam);
    }, [categoryParam]);

    useEffect(() => {
        fetch("/api/menu")
            .then((r) => r.json())
            .then((data: LiveMenuItem[]) => setMenuItems(data))
            .catch(() => setMenuItems([]))
            .finally(() => setLoading(false));
    }, []);

    const categories = useMemo(() => {
        const seen = new Set<string>();
        const cats: string[] = [];
        for (const item of menuItems) {
            if (item.categoryName && !seen.has(item.categoryName)) {
                seen.add(item.categoryName);
                cats.push(item.categoryName);
            }
        }
        return ["All", ...cats.sort()];
    }, [menuItems]);

    // For plain items: look up by parent petpoojaId
    const getItemQty = (id: string) => {
        if (!hydrated) return 0;
        return cartItems.find((c) => c.id === id)?.quantity ?? 0;
    };

    // For variant-only items: sum all variant quantities
    const getVariantTotalQty = (item: LiveMenuItem) => {
        if (!hydrated) return 0;
        return item.variants.reduce(
            (total, v) => total + (cartItems.find((c) => c.id === v.petpoojaId)?.quantity ?? 0),
            0,
        );
    };

    const filteredItems = useMemo(() => {
        return menuItems.filter((item) => {
            const matchesSearch   = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === "All" || item.categoryName === activeCategory;
            const matchesVeg      = !isVegOnly || item.isVeg;
            return matchesSearch && matchesCategory && matchesVeg;
        });
    }, [searchQuery, activeCategory, isVegOnly, menuItems]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#FFFDF0] dark:bg-background-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#FFFDF0] dark:bg-background-dark pb-40">
            <Header onSearch={setSearchQuery} />

            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                        Our <span className="text-terracotta">Menu</span>
                    </h2>
                    {isVegOnly && (
                        <span className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full text-[10px] font-black border border-green-200 dark:border-green-800">
                            <span className="w-2 h-2 rounded-full bg-green-600 inline-block" />
                            Veg only
                        </span>
                    )}
                </div>

                {/* Category pills */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 py-1">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all shadow-sm ${
                                activeCategory === cat
                                    ? "bg-[#0A2647] text-white shadow-md scale-105"
                                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Menu items */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredItems.map((item) => {
                        const variantOnly = isVariantOnly(item);
                        const quantity    = variantOnly
                            ? getVariantTotalQty(item)
                            : getItemQty(item.petpoojaId);

                        // Starting price label for variant-only items
                        const priceLabel = variantOnly
                            ? `from ₹${Math.min(...item.variants.map((v) => v.price))}`
                            : `₹${item.price}`;

                        return (
                            <motion.div
                                key={item.petpoojaId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-700/50 flex items-center gap-3 hover:shadow-md transition-shadow"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className="w-3 h-3 border flex-shrink-0 flex items-center justify-center p-[2px]"
                                            style={{ borderColor: item.isVeg ? "#16a34a" : "#dc2626" }}
                                        >
                                            <div
                                                className="w-full h-full rounded-full"
                                                style={{ backgroundColor: item.isVeg ? "#16a34a" : "#dc2626" }}
                                            />
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                            {item.categoryName}
                                        </span>
                                    </div>

                                    <h3 className="text-sm font-black text-terracotta dark:text-terracotta mb-1 line-clamp-2">
                                        {item.name}
                                    </h3>

                                    <span className="text-sm font-black text-royal-blue dark:text-primary">
                                        {priceLabel}
                                    </span>
                                </div>

                                <div className="flex items-center flex-shrink-0">
                                    {variantOnly ? (
                                        /* Variant-only: always open the picker */
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setVariantPickerItem(item)}
                                            className="h-10 px-4 bg-primary/10 dark:bg-primary/5 text-royal-blue dark:text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/20 relative"
                                        >
                                            {quantity > 0 && (
                                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-terracotta text-white rounded-full text-[9px] flex items-center justify-center font-black">
                                                    {quantity}
                                                </span>
                                            )}
                                            Select Size
                                        </motion.button>
                                    ) : quantity === 0 ? (
                                        /* Plain item — not in cart yet */
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() =>
                                                addItem({
                                                    id:       item.petpoojaId,
                                                    name:     item.name,
                                                    price:    item.price,
                                                    category: item.categoryName,
                                                    isVeg:    item.isVeg,
                                                })
                                            }
                                            className="h-10 px-4 bg-primary/10 dark:bg-primary/5 text-royal-blue dark:text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/20"
                                        >
                                            Add +
                                        </motion.button>
                                    ) : (
                                        /* Plain item — quantity stepper */
                                        <div className="flex items-center bg-primary text-white rounded-2xl h-10 px-2 gap-3 shadow-md shadow-primary/20">
                                            <motion.button
                                                whileTap={{ scale: 0.8 }}
                                                onClick={() => updateQuantity(item.petpoojaId, -1)}
                                                className="w-7 h-7 flex items-center justify-center bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">remove</span>
                                            </motion.button>
                                            <span className="text-xs font-black min-w-[12px] text-center">
                                                {quantity}
                                            </span>
                                            <motion.button
                                                whileTap={{ scale: 0.8 }}
                                                onClick={() => updateQuantity(item.petpoojaId, 1)}
                                                className="w-7 h-7 flex items-center justify-center bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">add</span>
                                            </motion.button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}

                    {filteredItems.length === 0 && (
                        <div className="py-20 text-center">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 block">
                                search_off
                            </span>
                            <p className="text-slate-500 font-bold">
                                No {isVegOnly ? "vegetarian " : ""}items found
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />

            {/* ── Variant picker bottom sheet ────────────────────────────── */}
            <AnimatePresence>
                {variantPickerItem && (
                    <>
                        {/* Scrim */}
                        <motion.div
                            key="scrim"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/40"
                            onClick={() => setVariantPickerItem(null)}
                        />

                        {/* Sheet */}
                        <motion.div
                            key="sheet"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl px-5 pt-5 pb-10 shadow-2xl"
                        >
                            {/* Handle */}
                            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5" />

                            <h3 className="text-base font-black text-slate-800 dark:text-white mb-1">
                                {variantPickerItem.name}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium mb-5">
                                Select your size
                            </p>

                            <div className="space-y-3">
                                {variantPickerItem.variants.map((variant) => {
                                    const vQty = getItemQty(variant.petpoojaId);
                                    return (
                                        <div
                                            key={variant.petpoojaId}
                                            className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3"
                                        >
                                            <div>
                                                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                                    {variant.name}
                                                </p>
                                                <p className="text-xs font-black text-royal-blue dark:text-primary">
                                                    ₹{variant.price}
                                                </p>
                                            </div>

                                            {vQty === 0 ? (
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => {
                                                        addItem({
                                                            id:       variant.petpoojaId,
                                                            name:     `${variantPickerItem.name} (${variant.name})`,
                                                            price:    variant.price,
                                                            category: variantPickerItem.categoryName,
                                                            isVeg:    variantPickerItem.isVeg,
                                                        });
                                                    }}
                                                    className="h-9 px-4 bg-primary/10 text-royal-blue dark:text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/20"
                                                >
                                                    Add +
                                                </motion.button>
                                            ) : (
                                                <div className="flex items-center bg-primary text-white rounded-xl h-9 px-2 gap-2 shadow-md shadow-primary/20">
                                                    <motion.button
                                                        whileTap={{ scale: 0.8 }}
                                                        onClick={() => updateQuantity(variant.petpoojaId, -1)}
                                                        className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-lg"
                                                    >
                                                        <span className="material-symbols-outlined text-base">remove</span>
                                                    </motion.button>
                                                    <span className="text-xs font-black min-w-[12px] text-center">
                                                        {vQty}
                                                    </span>
                                                    <motion.button
                                                        whileTap={{ scale: 0.8 }}
                                                        onClick={() => updateQuantity(variant.petpoojaId, 1)}
                                                        className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-lg"
                                                    >
                                                        <span className="material-symbols-outlined text-base">add</span>
                                                    </motion.button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setVariantPickerItem(null)}
                                className="mt-5 w-full py-3.5 bg-royal-blue text-white font-black rounded-2xl text-sm uppercase tracking-widest"
                            >
                                Done
                            </motion.button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </main>
    );
}

export default function MenuPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#FFFDF0] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
                </div>
            }
        >
            <MenuContent />
        </Suspense>
    );
}

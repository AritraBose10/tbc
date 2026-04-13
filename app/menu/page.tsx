"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useVegStore } from "@/store/useVegStore";
import menuData from "@/data/menu_clean.json";

function MenuContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [hydrated, setHydrated] = useState(false);

    const { items: cartItems, addItem, updateQuantity } = useCartStore();
    const { isVeg: isVegOnly } = useVegStore();

    useEffect(() => {
        setHydrated(true);
        if (categoryParam) {
            setActiveCategory(categoryParam);
        }
    }, [categoryParam]);

    const categories = ["All", ...Object.keys(menuData)];

    const menuItems = useMemo(() => {
        const items: any[] = [];
        Object.entries(menuData).forEach(([category, catItems]) => {
            (catItems as any[]).forEach((item, index) => {
                const id = `${category.replace(/\s+/g, "-")}-${index}`;
                items.push({ ...item, category, id });
            });
        });
        return items;
    }, []);

    const getItemQuantity = (id: string) => {
        if (!hydrated) return 0;
        return cartItems.find((item) => item.id === id)?.quantity || 0;
    };

    const filteredItems = useMemo(() => {
        return menuItems.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === "All" || item.category === activeCategory;
            const matchesVeg = !isVegOnly || item.isVeg === true;
            return matchesSearch && matchesCategory && matchesVeg;
        });
    }, [searchQuery, activeCategory, isVegOnly, menuItems]);

    return (
        <main className="min-h-screen bg-[#FFFDF0] dark:bg-background-dark pb-40">
            <Header onSearch={setSearchQuery} />

            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                        Our <span className="text-terracotta">Menu</span>
                    </h2>
                    <div className="flex items-center gap-2">
                        {isVegOnly && (
                            <span className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full text-[10px] font-black border border-green-200 dark:border-green-800">
                                <span className="w-2 h-2 rounded-full bg-green-600 inline-block" />
                                Veg only
                            </span>
                        )}
                    </div>
                </div>

                {/* Categories */}
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

                {/* Menu Items */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredItems.map((item) => {
                        const quantity = getItemQuantity(item.id);

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-700/50 flex items-center gap-3 group hover:shadow-md transition-shadow"
                            >
                                {/* Dish thumbnail */}
                                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>

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
                                            {item.category}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-black text-terracotta dark:text-terracotta mb-1 line-clamp-2">
                                        {item.name}
                                    </h3>
                                    <span className="text-sm font-black text-royal-blue dark:text-primary">
                                        ₹{item.price}
                                    </span>
                                </div>

                                <div className="flex items-center flex-shrink-0">
                                    {quantity === 0 ? (
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() =>
                                                addItem({
                                                    id: item.id,
                                                    name: item.name,
                                                    price: Number(item.price.split("/")[0]),
                                                    image: item.image,
                                                })
                                            }
                                            className="h-10 px-4 bg-primary/10 dark:bg-primary/5 text-royal-blue dark:text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/20"
                                        >
                                            Add +
                                        </motion.button>
                                    ) : (
                                        <div className="flex items-center bg-primary text-white rounded-2xl h-10 px-2 gap-3 shadow-md shadow-primary/20">
                                            <motion.button
                                                whileTap={{ scale: 0.8 }}
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="w-7 h-7 flex items-center justify-center bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">remove</span>
                                            </motion.button>
                                            <span className="text-xs font-black min-w-[12px] text-center">
                                                {quantity}
                                            </span>
                                            <motion.button
                                                whileTap={{ scale: 0.8 }}
                                                onClick={() => updateQuantity(item.id, 1)}
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

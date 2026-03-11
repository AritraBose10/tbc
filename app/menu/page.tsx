"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import menuData from "@/data/menu_clean.json";

export default function MenuPage() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [isVegOnly, setIsVegOnly] = useState(false);

    useEffect(() => {
        if (categoryParam) {
            setActiveCategory(categoryParam);
        }
    }, [categoryParam]);

    const categories = ["All", ...Object.keys(menuData)];

    // Memoize all menu items from the categorized object once
    const menuItems = useMemo(() => {
        const items: any[] = [];
        Object.entries(menuData).forEach(([category, catItems]) => {
            (catItems as any[]).forEach(item => {
                items.push({ ...item, category });
            });
        });
        return items;
    }, []);

    // Memoize filtered items
    const filteredItems = useMemo(() => {
        const filtered = menuItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === "All" || item.category === activeCategory;
            const matchesVeg = !isVegOnly || item.isVeg === true;
            return matchesSearch && matchesCategory && matchesVeg;
        });
        return filtered;
    }, [searchQuery, activeCategory, isVegOnly, menuItems]);


    return (
        <main className="min-h-screen bg-[#FFFDF0] dark:bg-background-dark pb-24">
            <Header
                onSearch={setSearchQuery}
                isVeg={isVegOnly}
                onVegToggle={setIsVegOnly}
            />

            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                        Our <span className="text-terracotta">Menu</span>
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        100% Fresh
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 py-1">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all shadow-sm ${activeCategory === cat
                                ? "bg-[#0A2647] text-white shadow-md scale-105"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredItems.map((item, idx) => (
                        <motion.div
                            key={`${item.name}-${idx}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.01 }}
                            className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-700/50 flex items-center justify-between group hover:shadow-md transition-shadow"
                        >
                            <div className="flex-1 pr-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`w-3 h-3 border flex items-center justify-center p-[2px] ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                                        <div className={`w-full h-full rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                                </div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white mb-1 group-hover:text-terracotta transition-colors">{item.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-royal-blue dark:text-primary">₹{item.price}</span>
                                </div>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="h-10 px-4 bg-primary/10 dark:bg-primary/5 text-royal-blue dark:text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/20"
                            >
                                Add +
                            </motion.button>
                        </motion.div>
                    ))}

                    {filteredItems.length === 0 && (
                        <div className="py-20 text-center">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">search_off</span>
                            <p className="text-slate-500 font-bold">No {isVegOnly ? 'vegetarian' : ''} items found matching your filter</p>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </main>
    );
}

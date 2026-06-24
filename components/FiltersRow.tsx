"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const NAV_CHIPS = [
    { id: "loved",  label: "Loved by Friends", icon: "diversity_1",           iconColor: "text-orange-500", href: "/menu?popular=true" },
    { id: "spicy",  label: "Spicy",            icon: "local_fire_department", iconColor: "text-red-500",    href: "/menu?spicy=true" },
    { id: "offers", label: "Great Offers",     icon: "sell",                  iconColor: "text-indigo-500", href: "/menu?maxPrice=150" },
    { id: "rated",  label: "Top Rated",        icon: "star",                  iconColor: "text-amber-500",  href: "/menu?sort=top" },
];

const SORT_OPTIONS = [
    { id: "default",    label: "Relevance" },
    { id: "price_asc",  label: "Price: Low → High" },
    { id: "price_desc", label: "Price: High → Low" },
    { id: "name",       label: "Name: A–Z" },
];

const PRICE_OPTIONS = [
    { id: "all",      label: "All",          maxPrice: null, minPrice: null },
    { id: "under100", label: "Under ₹100",   maxPrice: 100,  minPrice: null },
    { id: "100to200", label: "₹100 – ₹200",  maxPrice: 200,  minPrice: 100  },
    { id: "above200", label: "Above ₹200",   maxPrice: null, minPrice: 200  },
];

export default function FiltersRow() {
    const router = useRouter();
    const [showSheet, setShowSheet] = useState(false);
    const [sort, setSort]           = useState("default");
    const [priceRange, setPriceRange] = useState("all");

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (sort !== "default") params.set("sort", sort);
        const price = PRICE_OPTIONS.find((p) => p.id === priceRange);
        if (price?.maxPrice) params.set("maxPrice", String(price.maxPrice));
        if (price?.minPrice) params.set("minPrice", String(price.minPrice));
        const qs = params.toString();
        router.push(`/menu${qs ? `?${qs}` : ""}`);
        setShowSheet(false);
    };

    const clearFilters = () => {
        setSort("default");
        setPriceRange("all");
    };

    return (
        <>
            <section className="px-5 pb-6 pt-0 overflow-hidden bg-white dark:bg-slate-950">
                <div className="flex gap-2.5 overflow-x-auto scrollbar-hide py-2 snap-x">
                    {/* Filters button — opens bottom sheet */}
                    <motion.button
                        onClick={() => setShowSheet(true)}
                        whileHover={{ scale: 1.02, y: -0.5 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border shrink-0 snap-start transition-all text-[12px] font-black uppercase tracking-tighter bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px] text-slate-400">tune</span>
                        Filters
                        <span className="material-symbols-outlined text-[16px] opacity-60 ml-0.5">expand_more</span>
                    </motion.button>

                    {/* Navigation chips */}
                    {NAV_CHIPS.map((chip) => (
                        <Link key={chip.id} href={chip.href}>
                            <motion.div
                                whileHover={{ scale: 1.02, y: -0.5 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border shrink-0 snap-start transition-all text-[12px] font-black uppercase tracking-tighter cursor-pointer bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                            >
                                <span className={`material-symbols-outlined text-[18px] ${chip.iconColor}`}>
                                    {chip.icon}
                                </span>
                                {chip.label}
                            </motion.div>
                        </Link>
                    ))}
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800/50 mx-[-20px] mt-2 opacity-50" />
            </section>

            {/* Sort & Filter bottom sheet */}
            <AnimatePresence>
                {showSheet && (
                    <>
                        <motion.div
                            key="filter-scrim"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/40"
                            onClick={() => setShowSheet(false)}
                        />
                        <motion.div
                            key="filter-sheet"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl px-5 pt-5 pb-10 shadow-2xl"
                        >
                            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5" />
                            <h3 className="text-base font-black text-slate-800 dark:text-white mb-6">Sort & Filter</h3>

                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sort By</p>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {SORT_OPTIONS.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSort(s.id)}
                                        className={`px-4 py-2 rounded-full text-xs font-black border transition-all ${
                                            sort === s.id
                                                ? "bg-[#0A2647] text-white border-[#0A2647]"
                                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                                        }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>

                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Price Range</p>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {PRICE_OPTIONS.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setPriceRange(p.id)}
                                        className={`px-4 py-2 rounded-full text-xs font-black border transition-all ${
                                            priceRange === p.id
                                                ? "bg-[#0A2647] text-white border-[#0A2647]"
                                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={clearFilters}
                                    className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-black"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="flex-[2] py-3 rounded-2xl bg-[#0A2647] text-white text-sm font-black"
                                >
                                    Apply
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

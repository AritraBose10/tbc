"use client";

import { motion } from "framer-motion";

export default function FiltersRow() {
    const filters = [
        { id: "sort", label: "Filters", icon: "tune", active: false },
        { id: "fast", label: "Near & Fast", icon: "bolt", active: true },
        { id: "loved", label: "Loved by friends", icon: "diversity_1", active: false },
        { id: "spicy", label: "Spicy", icon: "local_fire_department", active: false },
        { id: "offers", label: "Great Offers", icon: "sell", active: false },
        { id: "rated", label: "Top Rated", icon: "star", active: false },
    ];

    return (
        <section className="px-5 pb-6 pt-1 overflow-hidden">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1 snap-x">
                {filters.map((filter, index) => (
                    <motion.button
                        key={filter.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border shrink-0 snap-start shadow-sm transition-colors text-xs font-bold ${filter.active
                            ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-md"
                            : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                    >
                        {filter.icon && (
                            <span className={`material-symbols-outlined text-[14px] ${filter.active
                                ? 'text-white dark:text-slate-900'
                                : filter.id === 'fast' ? 'text-green-600 dark:text-green-400'
                                    : filter.id === 'loved' ? 'text-orange-500'
                                        : filter.id === 'spicy' ? 'text-red-500'
                                            : filter.id === 'offers' ? 'text-blue-500'
                                                : filter.id === 'rated' ? 'text-amber-500'
                                                    : ''
                                }`}>
                                {filter.icon}
                            </span>
                        )}
                        {filter.label}
                        {filter.id === "sort" && (
                            <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                        )}
                    </motion.button>
                ))}
            </div>
        </section>
    );
}

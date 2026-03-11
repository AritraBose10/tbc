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
        <section className="px-5 pb-6 pt-0 overflow-hidden bg-white dark:bg-background-dark/50">
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide py-2 snap-x">
                {filters.map((filter, index) => (
                    <motion.button
                        key={filter.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.02, y: -0.5 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border shrink-0 snap-start transition-all text-[12px] font-extrabold ${filter.active
                            ? "bg-[#0A2647] border-[#0A2647] text-white shadow-lg shadow-blue-900/10"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm"
                            }`}
                    >
                        {filter.icon && (
                            <span className={`material-symbols-outlined text-[18px] ${filter.active
                                ? 'text-white'
                                : filter.id === 'fast' ? 'text-blue-500'
                                    : filter.id === 'loved' ? 'text-orange-500'
                                        : filter.id === 'spicy' ? 'text-red-500'
                                            : filter.id === 'offers' ? 'text-indigo-500'
                                                : filter.id === 'rated' ? 'text-amber-500'
                                                    : 'text-slate-400'
                                }`}>
                                {filter.icon}
                            </span>
                        )}
                        {filter.label}
                        {filter.id === "sort" && (
                            <span className="material-symbols-outlined text-[16px] opacity-60 ml-0.5">expand_more</span>
                        )}
                    </motion.button>
                ))}
            </div>
            {/* Subtle separator below filters */}
            <div className="h-px bg-slate-100 dark:bg-slate-800/50 mx-[-20px] mt-2 opacity-50" />
        </section>
    );
}

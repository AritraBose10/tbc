"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function Header({
    onSearch,
    isVeg = false,
    onVegToggle
}: {
    onSearch?: (query: string) => void,
    isVeg?: boolean,
    onVegToggle?: (isVeg: boolean) => void
}) {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (onSearch) onSearch(query);
    };

    return (
        <motion.header
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col bg-[#FFFDF0] dark:bg-background-dark p-4 px-5 sticky top-0 z-50 gap-4 border-b border-slate-100 dark:border-slate-800 shadow-sm"
        >
            <div className="flex items-center justify-between w-full">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    className="text-royal-blue dark:text-primary flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 cursor-pointer shadow-sm"
                >
                    <span className="material-symbols-outlined text-2xl">menu</span>
                </motion.div>

                <div className="flex flex-col items-center">
                    <motion.h1
                        initial={{ letterSpacing: "0.2em" }}
                        animate={{ letterSpacing: "0.05em" }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-royal-blue dark:text-primary text-xl font-black leading-tight uppercase tracking-tighter"
                    >
                        THE BIRYANI <span className="text-terracotta">CANTEEN</span>
                    </motion.h1>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 tracking-[0.3em] font-extrabold uppercase mt-0.5">
                        Multi-Cuisine Kitchen
                    </p>
                </div>

                <Link href="/cart">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="relative flex items-center justify-center rounded-full h-10 w-10 bg-slate-100 dark:bg-slate-800 text-royal-blue dark:text-primary cursor-pointer shadow-sm"
                    >
                        <span className="material-symbols-outlined">shopping_bag</span>
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, delay: 0.8 }}
                            className="absolute -top-1 -right-1 bg-terracotta text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-md shadow-terracotta/30"
                        >
                            2
                        </motion.span>
                    </motion.div>
                </Link>
            </div>

            {/* Search Bar & Veg Toggle */}
            <div className="flex items-center gap-3 w-full mt-1">
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-2xl flex items-center px-4 py-2.5 shadow-sm hover:shadow-md transition-all group"
                >
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-xl mr-2">search</span>
                    <input
                        type="text"
                        placeholder="Search for something yummy..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-semibold"
                    />
                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-2" />
                    <span className="material-symbols-outlined text-terracotta cursor-pointer hover:scale-110 transition-transform text-xl">mic</span>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => onVegToggle && onVegToggle(!isVeg)}
                    className="flex flex-col items-center justify-center shrink-0 cursor-pointer"
                >
                    <span className={`text-[9px] font-black mb-1.5 tracking-widest transition-colors ${isVeg ? 'text-green-600' : 'text-slate-400 uppercase opacity-60'}`}>VEG ONLY</span>
                    <div className={`w-12 h-6 rounded-full p-1 relative transition-all duration-300 border-2 ${isVeg ? 'bg-green-500/10 border-green-500' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                        <motion.div
                            animate={{
                                x: isVeg ? 24 : 0,
                                backgroundColor: isVeg ? '#10b981' : '#94a3b8'
                            }}
                            className="w-4 h-4 rounded-full shadow-sm flex items-center justify-center"
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-white' : 'bg-white/50'}`} />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.header>
    );
}

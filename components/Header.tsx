"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Header() {
    return (
        <motion.header
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col glass dark:glass-dark p-4 px-5 sticky top-0 z-50 gap-4"
        >
            <div className="flex items-center justify-between w-full">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    className="text-royal-blue dark:text-primary flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-2xl">menu</span>
                </motion.div>

                <div className="flex flex-col items-center">
                    <motion.h1
                        initial={{ letterSpacing: "0.2em" }}
                        animate={{ letterSpacing: "0.05em" }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-terracotta dark:text-primary text-lg font-extrabold leading-tight uppercase"
                    >
                        The Biryani Canteen
                    </motion.h1>
                    <p className="text-[9px] text-royal-blue/60 dark:text-slate-400 tracking-[0.25em] font-bold uppercase mt-0.5">
                        Multi-Cuisine Kitchen
                    </p>
                </div>

                <Link href="/cart">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="relative flex items-center justify-center rounded-full h-10 w-10 bg-primary/10 text-royal-blue dark:text-primary cursor-pointer"
                    >
                        <span className="material-symbols-outlined">shopping_bag</span>
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, delay: 0.8 }}
                            className="absolute -top-1 -right-1 bg-terracotta text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-md shadow-terracotta/30 animate-glow-pulse"
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
                    className="flex-1 bg-white/80 dark:bg-black/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full flex items-center px-4 py-2.5 shadow-sm hover:shadow-md transition-all group"
                >
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-xl mr-2">search</span>
                    <input
                        type="text"
                        placeholder="Search &quot;cake&quot;"
                        className="bg-transparent border-none outline-none w-full text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-medium"
                    />
                    <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-2" />
                    <span className="material-symbols-outlined text-terracotta cursor-pointer hover:scale-110 transition-transform text-xl">mic</span>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center justify-center shrink-0 w-12 cursor-pointer"
                >
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 mb-1 tracking-wider">VEG</span>
                    <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full relative shadow-inner transition-colors duration-300">
                        <motion.div
                            layout
                            className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"
                        />
                    </div>
                </motion.div>
            </div>
        </motion.header>
    );
}

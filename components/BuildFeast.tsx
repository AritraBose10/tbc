"use client";

import { motion } from "framer-motion";

export default function BuildFeast() {
    return (
        <section className="p-5 py-10">
            <motion.div
                className="relative bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center overflow-hidden premium-shadow"
            >
                {/* Background decorations */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-terracotta">
                    <span className="material-symbols-outlined text-[120px]">flatware</span>
                </div>
                <div className="absolute -bottom-4 -left-4 opacity-[0.02] text-royal-blue">
                    <span className="material-symbols-outlined text-[100px]">restaurant</span>
                </div>

                {/* Shimmer overlay */}
                <div className="absolute inset-0 shimmer-bg rounded-3xl pointer-events-none" />

                {/* Floating icon */}
                <motion.div
                    animate={{ y: [-4, 4, -4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-4 bg-terracotta/10 p-3 rounded-2xl"
                >
                    <span className="material-symbols-outlined text-4xl text-terracotta">
                        room_service
                    </span>
                </motion.div>

                <h3 className="text-3xl font-black mb-3 text-royal-blue dark:text-white drop-shadow-sm">
                    Build Your Royal Feast
                </h3>
                <p className="text-slate-600 dark:text-slate-300 font-medium mb-8 max-w-[280px]">
                    Curate your perfect meal with our signature sides and desserts.
                </p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-royal-blue text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-royal-blue/30 active:scale-95 transition-all text-sm tracking-wide border-2 border-transparent hover:border-royal-blue/20"
                >
                    Explore Menu
                </motion.button>
            </motion.div>
        </section>
    );
}

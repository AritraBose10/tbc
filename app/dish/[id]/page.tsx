"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function DishDetail() {
    const [portion, setPortion] = useState("regular");
    const [extraMeat, setExtraMeat] = useState(false);

    const dishInfo = {
        title: "Nawabi Tarkari Biryani",
        description:
            "Garden fresh vegetables layered with long grain basmati, slow-cooked in a sealed handi with our signature blend of 32 spices and saffron milk. Served with cooling cucumber raita and mirchi ka salan.",
        price: 14.99,
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuALHxVeoQp135l5733t5CcKGVriNpq8fo5pfnxtQfm4b4GpQ1VK3T6GrQUfCajgFCSwcf6YjzK-AceYZ4CL8l7oj-i-GuoGYm0H2tf9gIj31D5ZuxjZWA8efiohaZXP2hNgIJhirSIMvug9_ifNa1CQY_rO8LV3rz4wK9_r0bd6uldyM7gLBXgrzQKau2pmw_FWOyu7KWJ5L6jt_s40ARQ8DDRUi-UtVRvsA8hfz9BzmrnVVncgQihyr-1QX-aGOsIF0vao25sjeNq9",
        rating: 4.8,
        reviews: 124,
    };

    const finalPrice =
        (portion === "large" ? dishInfo.price + 5 : dishInfo.price) +
        (extraMeat ? 3 : 0);

    return (
        <main className="bg-background-light dark:bg-background-dark min-h-screen pb-28 mughal-pattern">
            {/* Header / Back Navigation */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 via-black/20 to-transparent"
            >
                <Link href="/">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 backdrop-blur-lg text-white border border-white/20"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </motion.div>
                </Link>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 backdrop-blur-lg text-white border border-white/20"
                >
                    <span
                        className="material-symbols-outlined fill-1"
                        style={{ color: "#f4c430" }}
                    >
                        favorite
                    </span>
                </motion.button>
            </motion.div>

            {/* High-Impact Photo */}
            <motion.div
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative w-full h-[48vh]"
            >
                <img
                    src={dishInfo.image}
                    alt={dishInfo.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-royal-blue/20 to-transparent" />
            </motion.div>

            {/* Floating Summary Card */}
            <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
                className="relative -mt-12 mx-5 glass dark:glass-dark p-7 rounded-3xl premium-shadow-lg z-10"
            >
                <div className="flex justify-between items-start mb-3">
                    <h1 className="text-royal-blue dark:text-primary text-2xl font-extrabold italic leading-tight max-w-[65%]">
                        {dishInfo.title}
                    </h1>
                    <motion.h2
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="text-terracotta font-black text-2xl"
                    >
                        ₹{dishInfo.price}
                    </motion.h2>
                </div>

                <div className="flex gap-3 items-center mb-5">
                    <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-sm fill-1">
                            star
                        </span>
                        <span className="text-xs font-black">{dishInfo.rating}</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {dishInfo.reviews} Reviews
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        25-30 min
                    </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {dishInfo.description}
                </p>
            </motion.div>

            {/* Customization Options */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="px-5 mt-8"
            >
                <h3 className="text-royal-blue dark:text-slate-200 font-bold mb-4 text-lg">
                    Portion Size
                </h3>
                <div className="flex gap-3">
                    {["regular", "large"].map((size) => (
                        <motion.button
                            key={size}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPortion(size)}
                            className={`flex-1 py-3.5 border-2 rounded-2xl text-sm font-bold capitalize transition-all duration-200 ${portion === size
                                ? "border-primary bg-primary/10 text-primary glow-border"
                                : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary/30"
                                }`}
                        >
                            {size}
                            {size === "large" && (
                                <span className="block text-[10px] font-normal opacity-70 mt-0.5">
                                    + ₹5.00
                                </span>
                            )}
                        </motion.button>
                    ))}
                </div>

                <h3 className="text-royal-blue dark:text-slate-200 font-bold mt-8 mb-4 text-lg">
                    Add-ons
                </h3>
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setExtraMeat(!extraMeat)}
                    className={`w-full flex justify-between items-center p-4 border-2 rounded-2xl transition-all duration-200 ${extraMeat
                        ? "border-primary bg-primary/10 glow-border"
                        : "border-slate-200 dark:border-slate-800 hover:border-primary/30"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={extraMeat ? "checked" : "unchecked"}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 ${extraMeat
                                    ? "bg-primary border-primary"
                                    : "border-slate-300 dark:border-slate-600"
                                    }`}
                            >
                                {extraMeat && (
                                    <span className="material-symbols-outlined text-white text-sm font-bold">
                                        check
                                    </span>
                                )}
                            </motion.div>
                        </AnimatePresence>
                        <span
                            className={`font-semibold ${extraMeat
                                ? "text-primary"
                                : "text-slate-600 dark:text-slate-300"
                                }`}
                        >
                            Extra Meat Portion
                        </span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-bold">+ ₹3.00</span>
                </motion.button>
            </motion.div>

            {/* Fixed Bottom Action */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
                className="fixed bottom-0 left-0 right-0 p-5 glass dark:glass-dark z-50 rounded-t-3xl"
            >
                <Link href="/checkout">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full flex items-center justify-between bg-terracotta hover:bg-terracotta/90 text-white py-4.5 px-7 rounded-2xl shadow-xl shadow-terracotta/40"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-white/70">
                                Total Price
                            </span>
                            <span className="text-xl font-black">
                                ₹{finalPrice.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 font-black uppercase tracking-widest text-sm">
                            Add to Cart
                            <motion.span
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="material-symbols-outlined bg-white/20 rounded-full p-1.5"
                            >
                                arrow_forward
                            </motion.span>
                        </div>
                    </motion.button>
                </Link>
            </motion.div>
        </main>
    );
}

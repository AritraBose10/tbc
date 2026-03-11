"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

export default function Cart() {
    const { items, updateQuantity, removeItem, getSubtotal, getTax, getTotal } = useCartStore();

    const subtotal = getSubtotal();
    const taxes = getTax();
    const total = getTotal();

    return (
        <main className="bg-background-light dark:bg-background-dark min-h-screen pb-56 mughal-pattern font-display">
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white dark:bg-background-dark border-b border-slate-100 dark:border-slate-800"
            >
                <Link href="/">
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-royal-blue dark:text-primary"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </motion.div>
                </Link>
                <h1 className="text-xl font-extrabold text-royal-blue dark:text-white">
                    Your Cart
                </h1>
                <div className="w-10" />
            </motion.div>

            <div className="p-5 space-y-5">
                {items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <motion.div
                            animate={{ y: [-5, 5, -5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-6"
                        >
                            <span className="material-symbols-outlined text-6xl text-primary">
                                shopping_bag
                            </span>
                        </motion.div>
                        <h2 className="text-2xl font-bold text-royal-blue dark:text-white mb-2">
                            Your cart is empty
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                            Looks like you haven&apos;t added any royal feasts yet.
                        </p>
                        <Link
                            href="/"
                            className="bg-royal-blue text-white px-8 py-3.5 rounded-full font-bold shadow-xl shadow-royal-blue/30"
                        >
                            Browse Menu
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <AnimatePresence mode="popLayout">
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 100, scale: 0.9 }}
                                    transition={{ delay: index * 0.08 }}
                                    className="bg-white dark:bg-slate-900/80 rounded-2xl p-4 flex gap-4 premium-shadow glow-border relative"
                                >
                                    <motion.button
                                        whileTap={{ scale: 0.8, rotate: 90 }}
                                        onClick={() => removeItem(item.id)}
                                        className="absolute top-3 right-3 w-7 h-7 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">
                                            close
                                        </span>
                                    </motion.button>
                                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-0.5">
                                        <div>
                                            <h3 className="font-bold text-royal-blue dark:text-slate-200 pr-7 leading-tight">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                                                Portion: {item.portion}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="font-black text-terracotta text-lg">
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </span>
                                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-full px-2 py-1.5">
                                                <motion.button
                                                    whileTap={{ scale: 0.8 }}
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-7 h-7 flex items-center justify-center text-royal-blue dark:text-primary rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        remove
                                                    </span>
                                                </motion.button>
                                                <motion.span
                                                    key={item.quantity}
                                                    initial={{ scale: 1.3 }}
                                                    animate={{ scale: 1 }}
                                                    className="font-black text-sm w-4 text-center dark:text-white"
                                                >
                                                    {item.quantity}
                                                </motion.span>
                                                <motion.button
                                                    whileTap={{ scale: 0.8 }}
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-7 h-7 flex items-center justify-center bg-primary text-royal-blue rounded-full shadow-sm"
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        add
                                                    </span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Cooking Instructions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 premium-shadow glow-border"
                        >
                            <div className="flex items-center gap-2 mb-3 text-royal-blue dark:text-primary">
                                <span className="material-symbols-outlined">edit_note</span>
                                <span className="font-bold text-sm">Cooking Instructions</span>
                            </div>
                            <textarea
                                placeholder="e.g. Make it extra spicy, less oil..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-slate-200 placeholder:text-slate-400 resize-none"
                                rows={2}
                            />
                        </motion.div>

                        {/* Bill Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white dark:bg-slate-900/80 rounded-2xl p-6 premium-shadow glow-border"
                        >
                            <h3 className="font-bold text-royal-blue dark:text-slate-200 mb-5">
                                Bill Details
                            </h3>
                            <div className="space-y-3.5 text-sm">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Item Total</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        ₹{subtotal.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Taxes &amp; Fees</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        ₹{taxes.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Delivery Fee</span>
                                    <span className="font-bold text-green-600">FREE</span>
                                </div>
                                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-3" />
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-royal-blue dark:text-white text-base">
                                        To Pay
                                    </span>
                                    <span className="text-xl font-black text-terracotta">
                                        ₹{total.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>

            {/* Fixed Checkout Bar */}
            {items.length > 0 && (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
                    className="fixed bottom-0 left-0 right-0 p-5 bg-white dark:bg-background-dark z-50 rounded-t-3xl border-t border-slate-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]"
                >
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                                Total Price
                            </p>
                            <p className="text-2xl font-black text-royal-blue dark:text-white">
                                ₹{total.toFixed(2)}
                            </p>
                        </div>
                        <Link
                            href="/checkout"
                            className="flex-[2] bg-royal-blue hover:bg-royal-blue/90 flex items-center justify-center gap-2 rounded-2xl text-white font-bold shadow-xl shadow-royal-blue/30 active:scale-95 transition-transform py-4"
                        >
                            <span>Proceed to Checkout</span>
                            <motion.span
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="material-symbols-outlined text-sm"
                            >
                                arrow_forward
                            </motion.span>
                        </Link>
                    </div>
                </motion.div>
            )}
        </main>
    );
}

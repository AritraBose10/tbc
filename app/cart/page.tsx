"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useCartAvailability } from "@/hooks/useCartAvailability";

export default function Cart() {
    const router = useRouter();
    const { items, updateQuantity, removeItem, getSubtotal, getTax, getTotal } = useCartStore();
    const { outOfStockIds, checking } = useCartAvailability();

    const subtotal = getSubtotal();
    const taxes = getTax();
    const total = getTotal();
    const hasOutOfStock = outOfStockIds.size > 0;

    return (
        <main className="bg-[#FFFDF0] dark:bg-background-dark min-h-screen pb-40">
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-0 z-40 flex items-center justify-between p-4 bg-[#FFFDF0] dark:bg-background-dark border-b border-slate-100 dark:border-slate-800"
            >
                <Link href="/">
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-royal-blue dark:text-primary"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </motion.div>
                </Link>
                <h1 className="text-xl font-extrabold text-royal-blue dark:text-white">Your Cart</h1>
                {items.length > 0 ? (
                    <button
                        onClick={() => useCartStore.getState().clearCart()}
                        className="text-xs font-bold text-red-500 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition-colors"
                    >
                        Clear
                    </button>
                ) : (
                    <div className="w-10" />
                )}
            </motion.div>

            <div className="p-5 space-y-4">
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
                            <span className="material-symbols-outlined text-6xl text-primary">shopping_bag</span>
                        </motion.div>
                        <h2 className="text-2xl font-bold text-royal-blue dark:text-white mb-2">
                            Your cart is empty
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                            Add something delicious to get started.
                        </p>
                        <Link
                            href="/menu"
                            className="bg-royal-blue text-white px-8 py-3.5 rounded-full font-bold shadow-xl shadow-royal-blue/30"
                        >
                            Browse Menu
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <AnimatePresence mode="popLayout">
                            {items.map((item, index) => {
                                const isOOS = outOfStockIds.has(item.id);
                                return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 100, scale: 0.9 }}
                                    transition={{ delay: index * 0.06 }}
                                    className={`bg-white dark:bg-slate-900/80 rounded-2xl p-4 flex gap-4 shadow-sm border relative ${isOOS ? "border-red-300 dark:border-red-700" : "border-slate-100 dark:border-slate-800"}`}
                                >
                                    <motion.button
                                        whileTap={{ scale: 0.8, rotate: 90 }}
                                        onClick={() => removeItem(item.id)}
                                        className="absolute top-3 right-3 w-7 h-7 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                    </motion.button>

                                    {isOOS && (
                                        <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                            Out of Stock
                                        </div>
                                    )}

                                    {/* Image or placeholder */}
                                    {item.image ? (
                                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-xl shrink-0 bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-3xl text-primary/50">fastfood</span>
                                        </div>
                                    )}

                                    <div className="flex-1 flex flex-col justify-between py-0.5 pr-6">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 leading-tight text-sm">
                                            {item.name}
                                        </h3>
                                        {item.addons && item.addons.length > 0 && (
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">
                                                {item.addons.map((a) => a.name).join(", ")}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="font-black text-terracotta text-base">
                                                ₹{((item.price + (item.addons ?? []).reduce((s, a) => s + a.price, 0)) * item.quantity).toFixed(0)}
                                            </span>
                                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-full px-2 py-1.5">
                                                <motion.button
                                                    whileTap={{ scale: 0.8 }}
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-7 h-7 flex items-center justify-center text-royal-blue dark:text-primary rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                                >
                                                    <span className="material-symbols-outlined text-sm">remove</span>
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
                                                    <span className="material-symbols-outlined text-sm">add</span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Cooking Instructions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800"
                        >
                            <div className="flex items-center gap-2 mb-3 text-royal-blue dark:text-primary">
                                <span className="material-symbols-outlined text-xl">edit_note</span>
                                <span className="font-bold text-sm">Cooking Instructions</span>
                            </div>
                            <textarea
                                placeholder="e.g. Make it extra spicy, less oil..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary outline-none dark:text-slate-200 placeholder:text-slate-400 resize-none"
                                rows={2}
                            />
                        </motion.div>

                        {/* Bill Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-slate-900/80 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800"
                        >
                            <h3 className="font-bold text-royal-blue dark:text-slate-200 mb-5">Bill Details</h3>
                            <div className="space-y-3.5 text-sm">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Item Total</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Taxes &amp; Fees</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹{taxes.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Delivery Fee</span>
                                    <span className="font-bold text-green-600">FREE</span>
                                </div>
                                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-2" />
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-royal-blue dark:text-white text-base">To Pay</span>
                                    <span className="text-xl font-black text-terracotta">₹{total.toFixed(2)}</span>
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
                    transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
                    className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-background-dark z-50 border-t border-slate-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]"
                >
                    {hasOutOfStock && (
                        <p className="text-center text-xs font-bold text-red-500 mb-2">
                            Remove out-of-stock items before checking out
                        </p>
                    )}
                    <button
                        onClick={() => !hasOutOfStock && router.push("/checkout")}
                        disabled={hasOutOfStock || checking}
                        className={`w-full flex items-center justify-between rounded-2xl text-white px-5 py-4 transition-all ${
                            hasOutOfStock
                                ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed"
                                : "bg-royal-blue shadow-xl shadow-royal-blue/30 active:scale-[0.98]"
                        }`}
                    >
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">
                                Total
                            </span>
                            <span className="text-xl font-extrabold" style={{ fontFamily: "system-ui, sans-serif" }}>
                                &#8377;{total.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-sm">
                            {hasOutOfStock ? "Items Unavailable" : "Proceed to Checkout"}
                            <span className="material-symbols-outlined text-base">
                                {hasOutOfStock ? "block" : "arrow_forward"}
                            </span>
                        </div>
                    </button>
                </motion.div>
            )}
        </main>
    );
}

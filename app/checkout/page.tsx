"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function Checkout() {
    const [paymentMethod, setPaymentMethod] = useState("upi");
    const [swiped, setSwiped] = useState(false);

    const dragX = useMotionValue(0);
    const dragBg = useTransform(
        dragX,
        [0, 250],
        ["rgba(178,34,34,1)", "rgba(34,139,34,1)"]
    );
    const dragOpacity = useTransform(dragX, [0, 200], [1, 0.3]);

    const handleDragEnd = () => {
        const x = dragX.get();
        if (x > 200) {
            animate(dragX, 290, { type: "spring", stiffness: 300 });
            setSwiped(true);
        } else {
            animate(dragX, 0, { type: "spring", stiffness: 300 });
        }
    };

    return (
        <main className="bg-background-light dark:bg-background-dark min-h-screen pb-44 mughal-pattern font-display">
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white dark:bg-background-dark border-b border-slate-100 dark:border-slate-800"
            >
                <Link href="/cart">
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-royal-blue dark:text-primary"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </motion.div>
                </Link>
                <h1 className="text-xl font-extrabold text-royal-blue dark:text-white">
                    Secure Checkout
                </h1>
                <div className="w-10" />
            </motion.div>

            <div className="p-5 space-y-6 mt-2">
                {/* Delivery Details */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900/80 rounded-2xl p-6 premium-shadow glow-border"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-royal-blue dark:text-slate-200">
                            Delivery Details
                        </h2>
                        <button className="text-terracotta text-sm font-bold uppercase hover:underline">
                            Edit
                        </button>
                    </div>
                    <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                        <div className="bg-primary/10 rounded-lg p-2">
                            <span className="material-symbols-outlined text-primary">
                                location_on
                            </span>
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">
                                Home
                            </p>
                            <p className="text-sm">123 Heritage Lane, Nizam Block</p>
                            <p className="text-sm">Hyderabad, 500001</p>
                        </div>
                    </div>
                </motion.section>

                {/* Order Summary */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-900/80 rounded-2xl p-6 premium-shadow glow-border"
                >
                    <h2 className="font-bold text-royal-blue dark:text-slate-200 mb-5">
                        Order Summary
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                    1x Nawabi Tarkari Biryani
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Portion: Large</p>
                            </div>
                            <p className="font-bold text-sm dark:text-slate-200">₹19.99</p>
                        </div>
                        <div className="flex justify-between items-start">
                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                Extra Meat Portion
                            </p>
                            <p className="font-bold text-sm dark:text-slate-200">₹3.00</p>
                        </div>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-5" />
                    <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>Subtotal</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                ₹22.99
                            </span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>Taxes &amp; Fees</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                ₹2.50
                            </span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>Delivery (Royal Express)</span>
                            <span className="text-green-600 font-bold">FREE</span>
                        </div>
                    </div>
                </motion.section>

                {/* Payment Options */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                >
                    <h2 className="font-bold text-royal-blue dark:text-slate-200 ml-1 mb-1">
                        Payment Method
                    </h2>

                    {[
                        {
                            id: "upi",
                            label: "Pay via UPI",
                            sub: "Recommended for instant refund",
                            icon: (
                                <span className="font-black text-[10px] text-primary">UPI</span>
                            ),
                        },
                        {
                            id: "card",
                            label: "Credit / Debit Card",
                            sub: null,
                            icon: (
                                <span className="material-symbols-outlined text-slate-500 text-lg">
                                    credit_card
                                </span>
                            ),
                        },
                    ].map((method) => (
                        <motion.div
                            key={method.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPaymentMethod(method.id)}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${paymentMethod === method.id
                                ? "border-primary bg-primary/5 glow-border"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-primary/30"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                                    {method.icon}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                        {method.label}
                                    </p>
                                    {method.sub && (
                                        <p className="text-[11px] text-green-600 font-bold">
                                            {method.sub}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === method.id
                                    ? "border-primary"
                                    : "border-slate-300"
                                    }`}
                            >
                                {paymentMethod === method.id && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500 }}
                                        className="w-2.5 h-2.5 bg-primary rounded-full"
                                    />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.section>
            </div>

            {/* Swipe to Pay Fixed Bottom */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
                className="fixed bottom-0 left-0 right-0 p-5 bg-white dark:bg-background-dark z-50 rounded-t-3xl border-t border-slate-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]"
            >
                <div className="flex justify-between items-center mb-5 px-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                        Amount to Pay
                    </span>
                    <span className="text-2xl font-black text-royal-blue dark:text-white">
                        ₹25.49
                    </span>
                </div>

                {/* Real Drag Swipe Button */}
                <motion.div
                    style={{ backgroundColor: dragBg }}
                    className="relative w-full h-16 rounded-full flex items-center justify-center overflow-hidden"
                >
                    {!swiped && (
                        <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 290 }}
                            dragElastic={0.05}
                            style={{ x: dragX }}
                            onDragEnd={handleDragEnd}
                            whileTap={{ scale: 0.95 }}
                            className="absolute left-1.5 top-1.5 bottom-1.5 w-13 bg-white rounded-full flex items-center justify-center z-10 cursor-grab active:cursor-grabbing shadow-lg"
                        >
                            <span className="material-symbols-outlined text-terracotta">
                                double_arrow
                            </span>
                        </motion.div>
                    )}

                    {swiped ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-white">
                                check_circle
                            </span>
                            <span className="text-white font-black uppercase tracking-widest text-sm">
                                Order Placed!
                            </span>
                        </motion.div>
                    ) : (
                        <motion.span
                            style={{ opacity: dragOpacity }}
                            className="text-white font-black uppercase tracking-widest text-sm z-0 pl-10"
                        >
                            Swipe To Pay
                        </motion.span>
                    )}
                </motion.div>
            </motion.div>
        </main>
    );
}

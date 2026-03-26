"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function CartBar() {
    const pathname = usePathname();
    const [hydrated, setHydrated] = useState(false);
    const items = useCartStore((state) => state.items);

    useEffect(() => setHydrated(true), []);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const HIDE_ON = ["/cart", "/checkout"];
    const visible =
        hydrated &&
        totalItems > 0 &&
        !HIDE_ON.includes(pathname) &&
        !pathname.startsWith("/dish/");

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 120, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 120, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="fixed bottom-[76px] left-3 right-3 z-40 pointer-events-none"
                >
                    <Link href="/cart" className="pointer-events-auto block">
                        <div className="bg-[#002366] text-white rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-2xl shadow-[#002366]/50 border border-white/10">
                            {/* Left: item count badge */}
                            <div className="flex items-center gap-3">
                                <motion.div
                                    key={totalItems}
                                    initial={{ scale: 1.4 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500 }}
                                    className="bg-white/20 rounded-xl w-9 h-9 flex items-center justify-center text-sm font-black shrink-0"
                                >
                                    {totalItems}
                                </motion.div>
                                <span className="text-sm font-bold">
                                    {totalItems === 1 ? "1 item" : `${totalItems} items`} added
                                </span>
                            </div>

                            {/* Right: price + CTA */}
                            <div className="flex items-center gap-3">
                                <span className="text-base font-black">₹{subtotal.toFixed(0)}</span>
                                <div className="flex items-center gap-0.5 text-[#d4af35] font-black text-sm">
                                    <span>View Cart</span>
                                    <span className="material-symbols-outlined text-base">chevron_right</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

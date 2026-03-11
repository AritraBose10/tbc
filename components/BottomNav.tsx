"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: "/", icon: "home", label: "Home" },
        { href: "/menu", icon: "restaurant_menu", label: "Menu" },
        { href: "/cart", icon: "shopping_bag", label: "Cart" },
        { href: "/profile", icon: "account_circle", label: "Profile" },
    ];

    // Show cart overlay only on Home/Menu (mock logic)
    const showCartOverlay = pathname === "/" || pathname === "/menu";

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">

            {showCartOverlay && (
                <div className="px-4 pb-3 pointer-events-auto">
                    <Link href="/cart">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-800 dark:bg-slate-700 p-2 rounded-xl border border-slate-700 dark:border-slate-600">
                                    <span className="material-symbols-outlined text-green-400">shopping_bag</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase mb-0.5">2 Items Added</span>
                                    <span className="text-sm font-black text-white">₹475.00 <span className="text-[10px] text-slate-500 font-medium line-through ml-1">₹550.00</span></span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 px-4 py-3 rounded-xl shadow-md">
                                View Cart <span className="material-symbols-outlined text-[16px]">arrow_right_alt</span>
                            </div>
                        </motion.div>
                    </Link>
                </div>
            )}

            <div className="bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-700 flex gap-1 px-3 pb-6 pt-3 pointer-events-auto shadow-[0_-4px_30px_-5px_rgba(0,0,0,0.12)] dark:shadow-[0_-4px_30px_-5px_rgba(0,0,0,0.6)]">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-1 flex-col items-center justify-center gap-1 relative"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNavPill"
                                    className="absolute -top-1.5 w-8 h-1 bg-primary rounded-full shadow-md shadow-primary/50"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <motion.div
                                whileTap={{ scale: 0.8 }}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200 ${isActive
                                    ? "text-primary bg-primary/10"
                                    : "text-slate-400 dark:text-slate-500 hover:text-primary/70"
                                    }`}
                            >
                                <span
                                    className={`material-symbols-outlined ${isActive ? "fill-1" : ""
                                        }`}
                                >
                                    {item.icon}
                                </span>
                            </motion.div>
                            <p
                                className={`text-[9px] font-bold leading-normal tracking-wider uppercase transition-colors duration-200 ${isActive ? "text-primary" : "text-slate-400 dark:text-slate-500"
                                    }`}
                            >
                                {item.label}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

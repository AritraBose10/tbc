"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const MENU_ITEMS = [
    { label: "Home", href: "/", icon: "home" },
    { label: "Menu", href: "/menu", icon: "restaurant_menu" },
    { label: "Offers", href: "/offers", icon: "sell" },
    { label: "Orders", href: "/orders", icon: "receipt_long" },
    { label: "Profile", href: "/profile", icon: "person" },
    { label: "Support", href: "/support", icon: "help" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop — z-50 covers sticky z-40 header */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
                    />

                    {/* Drawer — z-[60] sits above backdrop */}
                    <motion.aside
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 220 }}
                        className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-slate-950 shadow-2xl z-[60] flex flex-col"
                    >
                        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-2xl bg-royal-blue text-white flex items-center justify-center font-black text-xl shadow-lg shadow-royal-blue/30">
                                    TBC
                                </div>
                                <div>
                                    <h2 className="font-black text-lg text-slate-900 dark:text-white leading-none">The Biryani Canteen</h2>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Multi-Cuisine Kitchen</span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
                            {MENU_ITEMS.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                                            isActive
                                                ? "bg-royal-blue text-white shadow-md shadow-royal-blue/20"
                                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-center text-slate-400 dark:text-slate-600 font-medium">
                                The Biryani Canteen &copy; 2025
                            </p>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

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

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
            {/* Cart overlay removed as it contained mock data. Real cart state integration needed. */}

            <div className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-700 flex gap-1 px-3 pb-6 pt-3 pointer-events-auto shadow-[0_-4px_30px_-5px_rgba(0,0,0,0.12)] dark:shadow-[0_-4px_30px_-5px_rgba(0,0,0,0.6)]">
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

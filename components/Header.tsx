"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useVegStore } from "@/store/useVegStore";
import Sidebar from "./Sidebar";

interface MenuItem {
    petpoojaId: string;
    name: string;
    price: number;
    categoryName: string;
    isVeg: boolean;
}

export default function Header({
    onSearch,
}: {
    onSearch?: (query: string) => void;
}) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [hydrated, setHydrated] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [allItems, setAllItems] = useState<MenuItem[]>([]);
    const [suggestions, setSuggestions] = useState<MenuItem[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const getTotalItems = useCartStore((state) => state.getTotalItems);
    const { isVeg, toggle: toggleVeg } = useVegStore();

    useEffect(() => {
        setHydrated(true);
        // Pre-fetch menu for instant suggestions
        fetch("/api/menu")
            .then((r) => r.json())
            .then((data: MenuItem[]) => setAllItems(data))
            .catch(() => {});
    }, []);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (onSearch) onSearch(query);

        if (query.trim().length > 1) {
            const q = query.toLowerCase();
            setSuggestions(
                allItems
                    .filter((item) => item.name.toLowerCase().includes(q))
                    .slice(0, 6)
            );
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectSuggestion = (item: MenuItem) => {
        setSearchQuery("");
        setSuggestions([]);
        setIsFocused(false);
        if (onSearch) onSearch("");
        // Navigate to menu filtered by category so user can see the item
        router.push(`/menu?category=${encodeURIComponent(item.categoryName)}&q=${encodeURIComponent(item.name)}`);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsFocused(false);
        router.push(`/menu?q=${encodeURIComponent(searchQuery.trim())}`);
    };

    const cartCount = hydrated ? getTotalItems() : 0;

    return (
        <>
            <motion.header
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col bg-[#FFFDF0] dark:bg-background-dark p-4 px-5 sticky top-0 z-40 gap-4 border-b border-slate-100 dark:border-slate-800 shadow-sm"
            >
                <div className="flex items-center justify-between w-full">
                    <motion.button
                        onClick={() => setIsSidebarOpen(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        className="text-royal-blue dark:text-primary flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 cursor-pointer shadow-sm"
                    >
                        <span className="material-symbols-outlined text-2xl">menu</span>
                    </motion.button>

                    <div className="flex flex-col items-center">
                        <motion.h1
                            initial={{ letterSpacing: "0.2em" }}
                            animate={{ letterSpacing: "0.05em" }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="text-royal-blue dark:text-primary text-xl font-black leading-tight uppercase tracking-tighter"
                        >
                            THE BIRYANI <span className="text-terracotta">CANTEEN</span>
                        </motion.h1>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 tracking-[0.3em] font-extrabold uppercase mt-0.5">
                            Multi-Cuisine Kitchen
                        </p>
                    </div>

                    <Link href="/cart">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="relative flex items-center justify-center rounded-full h-10 w-10 bg-slate-100 dark:bg-slate-800 text-royal-blue dark:text-primary cursor-pointer shadow-sm"
                        >
                            <span className="material-symbols-outlined">shopping_bag</span>
                            {cartCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500 }}
                                    className="absolute -top-1 -right-1 bg-terracotta text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-md shadow-terracotta/30"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </motion.div>
                    </Link>
                </div>

                {/* Search Bar & Veg Toggle */}
                <div className="flex items-center gap-3 w-full mt-1" ref={containerRef}>
                    <motion.form
                        onSubmit={handleSearchSubmit}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex-1 relative"
                    >
                        <div className={`flex-1 bg-white dark:bg-slate-900 border rounded-2xl flex items-center px-4 py-2.5 shadow-sm transition-all group ${isFocused ? "border-primary shadow-md shadow-primary/10" : "border-slate-200 dark:border-slate-700/50 hover:shadow-md"}`}>
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-xl mr-2">search</span>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search for something yummy..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={() => setIsFocused(true)}
                                className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-semibold"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => { setSearchQuery(""); setSuggestions([]); if (onSearch) onSearch(""); }}
                                    className="ml-1 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            )}
                        </div>

                        {/* Suggestions Dropdown */}
                        <AnimatePresence>
                            {isFocused && suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50"
                                >
                                    {suggestions.map((item, i) => (
                                        <button
                                            key={item.petpoojaId}
                                            type="button"
                                            onMouseDown={() => handleSelectSuggestion(item)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left ${i < suggestions.length - 1 ? "border-b border-slate-50 dark:border-slate-800" : ""}`}
                                        >
                                            <span className="material-symbols-outlined text-slate-300 text-lg flex-shrink-0">search</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                                                <p className="text-[11px] text-slate-400 font-medium truncate">{item.categoryName} · ₹{item.price}</p>
                                            </div>
                                            <span
                                                className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                                                style={{
                                                    color: item.isVeg ? "#16a34a" : "#dc2626",
                                                    backgroundColor: item.isVeg ? "#f0fdf4" : "#fef2f2",
                                                }}
                                            >
                                                {item.isVeg ? "VEG" : "NON-VEG"}
                                            </span>
                                        </button>
                                    ))}

                                    {/* Full search CTA */}
                                    <button
                                        type="submit"
                                        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-primary/5 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-primary text-lg">arrow_forward</span>
                                        <p className="text-sm font-bold text-primary">See all results for &quot;{searchQuery}&quot;</p>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.form>

                    <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        onClick={toggleVeg}
                        className="flex flex-col items-center justify-center shrink-0 cursor-pointer"
                    >
                        <span className={`text-[9px] font-black mb-1.5 tracking-widest transition-colors ${isVeg ? "text-green-600" : "text-slate-400 opacity-60"}`}>
                            VEG ONLY
                        </span>
                        <div className={`w-12 h-6 rounded-full p-1 relative transition-all duration-300 border-2 ${isVeg ? "bg-green-500/10 border-green-500" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>
                            <motion.div
                                animate={{
                                    x: isVeg ? 24 : 0,
                                    backgroundColor: isVeg ? "#10b981" : "#94a3b8",
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="w-4 h-4 rounded-full shadow-sm flex items-center justify-center"
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? "bg-white" : "bg-white/50"}`} />
                            </motion.div>
                        </div>
                    </motion.button>
                </div>
            </motion.header>

            {/* Sidebar rendered after header so its fixed backdrop sits above the sticky header */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
    );
}

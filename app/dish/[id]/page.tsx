"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { use } from "react";
import { useCartStore } from "@/store/useCartStore";
import menuData from "@/data/menu_clean.json";

// Build a flat lookup map from all possible ID formats
function buildDishMap() {
    const map = new Map<string, { name: string; price: string; isVeg: boolean; category: string; id: string; image?: string }>();
    Object.entries(menuData).forEach(([category, items]) => {
        (items as { name: string; price: string; isVeg: boolean }[]).forEach((item, index) => {
            const indexId = `${category.replace(/\s+/g, '-')}-${index}`;
            const slugId = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const entry = { ...item, category, id: indexId };
            map.set(indexId, entry);
            map.set(slugId, { ...entry, id: slugId });
        });
    });
    return map;
}

const dishMap = buildDishMap();

export default function DishDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { addItem } = useCartStore();

    const dish = dishMap.get(id);

    if (!dish) {
        return (
            <main className="min-h-screen bg-[#FFFDF0] flex flex-col items-center justify-center p-6 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">fastfood</span>
                <h1 className="text-2xl font-black text-slate-800 mb-2">Dish not found</h1>
                <Link href="/menu" className="mt-4 bg-royal-blue text-white px-6 py-3 rounded-2xl font-bold">
                    Browse Menu
                </Link>
            </main>
        );
    }

    const basePrice = parseFloat(dish.price.split('/')[0]);

    return (
        <main className="bg-[#FFFDF0] dark:bg-background-dark min-h-screen pb-28">
            {/* Hero Image */}
            {dish.image && (
                <div className="relative h-64 w-full overflow-hidden">
                    <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    {/* Back button overlaid on image */}
                    <Link href="/menu" className="absolute top-4 left-4">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm text-slate-700 shadow"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </motion.div>
                    </Link>
                    <span className="absolute bottom-4 left-5 text-xs font-black text-white/80 uppercase tracking-widest">
                        {dish.category}
                    </span>
                </div>
            )}

            {/* Fallback header when no image */}
            {!dish.image && (
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="sticky top-0 z-50 flex items-center justify-between p-4 bg-[#FFFDF0]/90 dark:bg-background-dark/90 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800"
                >
                    <Link href="/menu">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </motion.div>
                    </Link>
                    <span className="text-sm font-black text-slate-700 dark:text-white uppercase tracking-widest">{dish.category}</span>
                    <div className="w-10" />
                </motion.div>
            )}

            {/* Dish Info Card */}
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 20 }}
                className="mx-5 mt-8 bg-white dark:bg-slate-800 p-7 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700"
            >
                {/* Veg/Non-veg indicator */}
                <div className="flex items-center gap-2 mb-4">
                    <span className={`w-4 h-4 border-2 flex items-center justify-center p-[3px] ${dish.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                        <div className={`w-full h-full rounded-full ${dish.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                    </span>
                </div>

                <h1 className="text-royal-blue dark:text-primary text-2xl font-extrabold leading-tight mb-5">
                    {dish.name}
                </h1>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-5">
                    <div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block mb-0.5">Price</span>
                        <span className="text-terracotta font-black text-3xl">₹{dish.price}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-xl">
                        The Biryani Canteen
                    </span>
                </div>
            </motion.div>

            {/* Fixed Bottom Action */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
                className="fixed bottom-0 left-0 right-0 p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-50"
            >
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addItem({
                        id: dish.id,
                        name: dish.name,
                        price: basePrice,
                        portion: "Standard",
                        image: dish.image,
                    })}
                    className="w-full flex items-center justify-between bg-terracotta hover:bg-terracotta/90 text-white py-4 px-7 rounded-2xl shadow-xl shadow-terracotta/40"
                >
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-white/70">
                            Price
                        </span>
                        <span className="text-xl font-black">
                            ₹{basePrice.toFixed(2)}
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
            </motion.div>
        </main>
    );
}

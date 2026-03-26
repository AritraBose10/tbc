"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import menuData from "@/data/menu_clean.json";
import { useCartStore } from "@/store/useCartStore";

export default function ChefSpecials() {
    const { addItem } = useCartStore();

    const categories = Object.keys(menuData) as (keyof typeof menuData)[];
    const specials = categories.slice(0, 6).map((category, index) => {
        const item = menuData[category][0];

        const images = [
            "https://images.unsplash.com/photo-1563379091339-03b11adca53b?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1603894584373-5ac82b0f5013?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1589187151003-8dc9c058778f?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop",
        ];

        return {
            id: item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
            title: item.name,
            price: `₹${item.price.split("/")[0]}`,
            isVeg: item.isVeg,
            image: images[index % images.length],
        };
    });

    return (
        <section className="py-6 px-5 overflow-hidden">
            <motion.div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-royal-blue dark:text-white text-xl font-extrabold tracking-tight">
                        Chef&apos;s Specials
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">Handcrafted masterpieces</p>
                </div>
                <Link href="/menu" className="text-xs font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full shadow-sm hover:bg-red-100 transition-colors">
                    See all
                </Link>
            </motion.div>

            <motion.div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide cursor-grab active:cursor-grabbing">
                {specials.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ y: -4, transition: { duration: 0.25 } }}
                        className="min-w-[220px] snap-center bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800"
                    >
                        <Link href={`/dish/${item.id}`} className="block">
                            <div className="relative h-36 overflow-hidden">
                                <img
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                                    alt={item.title}
                                    src={item.image}
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full shadow-sm">
                                    <span className="material-symbols-outlined text-[14px] text-slate-400 block hover:text-red-500 transition-colors">favorite</span>
                                </div>
                            </div>

                            <div className="p-3.5">
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className="w-3 h-3 border flex items-center justify-center p-[2px]"
                                        style={{ borderColor: item.isVeg ? "#16a34a" : "#dc2626" }}
                                    >
                                        <div
                                            className="w-full h-full rounded-full"
                                            style={{ backgroundColor: item.isVeg ? "#16a34a" : "#dc2626" }}
                                        />
                                    </span>
                                </div>
                                <h5 className="text-slate-900 dark:text-white font-bold text-base leading-tight truncate mb-1">
                                    {item.title}
                                </h5>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3 truncate">
                                    The Biryani Canteen
                                </p>

                                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Price</span>
                                        <span className="text-slate-900 dark:text-white font-black text-sm">{item.price}</span>
                                    </div>
                                    <motion.button
                                        onClick={(e: React.MouseEvent) => {
                                            e.preventDefault();
                                            addItem({
                                                id: item.id,
                                                name: item.title,
                                                price: parseFloat(item.price.replace("₹", "")),
                                                quantity: 1,
                                            });
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30"
                                    >
                                        ADD
                                    </motion.button>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}

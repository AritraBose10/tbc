"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import menuData from "@/data/menu_clean.json";

export default function ChefSpecials() {
    // Extract specific real items for specials
    const specials = [
        {
            id: "chicken-biryani",
            title: menuData["Biryani & Rice"].find(item => item.name === "CHICKEN BIRYANI")?.name || "Chicken Biryani",
            restaurant: "The Biryani Canteen",
            description: "Aromatic basmati rice layered with succulent chicken and spices.",
            price: `₹${menuData["Biryani & Rice"].find(item => item.name === "CHICKEN BIRYANI")?.price || "130"}`,
            rating: "4.9",
            eta: "30-35 mins",
            image: "https://images.unsplash.com/photo-1563379091339-03b11adca53b?q=80&w=800&auto=format&fit=crop",
            badge: "BESTSELLER",
            discount: "Flat ₹20 OFF"
        },
        {
            id: "chicken-chaap",
            title: menuData["Main Course & Breads"].find(item => item.name === "CHICKEN CHAAP ( 1 PC)")?.name || "Chicken Chaap",
            restaurant: "The Biryani Canteen",
            description: "Slow-cooked chicken in a rich, poppy seed and cashew gravy.",
            price: `₹${menuData["Main Course & Breads"].find(item => item.name === "CHICKEN CHAAP ( 1 PC)")?.price || "100"}`,
            rating: "4.8",
            eta: "25-30 mins",
            image: "https://images.unsplash.com/photo-1603894584373-5ac82b0f5013?q=80&w=800&auto=format&fit=crop",
            badge: "CHEF PICK",
            proDiscount: "Pro extra 10% OFF"
        },
        {
            id: "chicken-kasha",
            title: menuData["Main Course & Breads"].find(item => item.name === "CHICKEN KASHA (2 PCS)")?.name || "Chicken Kasha (2 Pcs)",
            restaurant: "The Biryani Canteen",
            description: "Traditional Bengali style spicy chicken curry.",
            price: `₹${menuData["Main Course & Breads"].find(item => item.name === "CHICKEN KASHA (2 PCS)")?.price || "80"}`,
            rating: "4.7",
            eta: "20-25 mins",
            image: "https://images.unsplash.com/photo-1589187151003-8dc9c058778f?q=80&w=800&auto=format&fit=crop",
            badge: "MUST TRY"
        },
        {
            id: "dal-makhani",
            title: menuData["Main Course & Breads"].find(item => item.name === "DAL MAKHANI")?.name || "Dal Makhani",
            restaurant: "The Biryani Canteen",
            description: "Black lentils simmered overnight with butter and cream.",
            price: `₹${menuData["Main Course & Breads"].find(item => item.name === "DAL MAKHANI")?.price || "80"}`,
            rating: "4.6",
            eta: "20-25 mins",
            image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop",
            badge: "POPULAR"
        },
        {
            id: "butter-naan",
            title: menuData["Main Course & Breads"].find(item => item.name === "BUTTER NAAN")?.name || "Butter Naan",
            restaurant: "The Biryani Canteen",
            description: "Soft tandoori bread glazed with fresh butter.",
            price: `₹${menuData["Main Course & Breads"].find(item => item.name === "BUTTER NAAN")?.price || "50"}`,
            rating: "4.5",
            eta: "10-15 mins",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop",
            badge: "FRESH"
        },
    ];

    return (
        <section className="py-6 px-5 overflow-hidden">
            <motion.div
                className="flex items-center justify-between mb-5"
            >
                <div>
                    <h3 className="text-royal-blue dark:text-white text-xl font-extrabold tracking-tight">
                        Chef&apos;s Specials
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">Handcrafted masterpieces</p>
                </div>
                <Link href="/dish/all" className="text-xs font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full shadow-sm">See all</Link>
            </motion.div>

            <motion.div
                className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide cursor-grab active:cursor-grabbing"
            >
                {specials.map((item, index) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ y: -4, transition: { duration: 0.25 } }}
                        className="min-w-[260px] snap-center bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800"
                    >
                        <Link href={`/dish/${item.id}`} className="block">
                            <div className="relative h-40 overflow-hidden">
                                <img
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                                    alt={item.title}
                                    src={item.image}
                                />
                                {/* Detail Overlays */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                                {item.badge && (
                                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-widest">
                                        {item.badge}
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full shadow-sm">
                                    <span className="material-symbols-outlined text-[14px] text-slate-400 block hover:text-red-500 transition-colors">favorite</span>
                                </div>

                                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                    <div className="flex flex-col gap-1">
                                        {item.proDiscount ? (
                                            <span className="text-[9px] font-bold text-red-100 bg-red-600/90 rounded px-1.5 py-0.5 uppercase tracking-wider w-fit">
                                                {item.proDiscount}
                                            </span>
                                        ) : item.discount ? (
                                            <span className="text-[12px] font-black text-white leading-tight drop-shadow-md">
                                                {item.discount}
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded text-white font-bold text-[10px]">
                                        <span>{item.eta}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3.5">
                                <div className="flex justify-between items-start mb-1">
                                    <h5 className="text-slate-900 dark:text-white font-bold text-base leading-tight truncate pr-2">
                                        {item.title}
                                    </h5>
                                    <div className="flex items-center gap-0.5 bg-green-700 px-1.5 py-0.5 rounded shrink-0">
                                        <span className="text-[11px] font-bold text-white">
                                            {item.rating}
                                        </span>
                                        <span className="material-symbols-outlined text-[10px] text-white fill-1">
                                            star
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1 truncate">
                                    {item.restaurant}
                                </p>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mb-3">
                                    {item.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto border-t border-slate-100 dark:border-slate-800 pt-3">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Price</span>
                                        <span className="text-slate-900 dark:text-white font-black text-sm">{item.price}</span>
                                    </div>
                                    <motion.button
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

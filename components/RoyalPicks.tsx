"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import menuData from "@/data/menu_clean.json";

export default function RoyalPicks() {
    interface MenuItem {
        id: string;
        title: string;
        restaurant: string;
        description: string;
        price: string;
        rating: string;
        eta: string;
        image: string;
        discount?: string;
        proDiscount?: string;
    }

    const picks: MenuItem[] = [
        {
            id: "chicken-burger",
            title: menuData["Fast Food & Snacks"].find(item => item.name === "CHICKEN BURGER")?.name || "Chicken Burger",
            restaurant: "The Biryani Canteen",
            description: "Juicy chicken patty with fresh lettuce and secret sauce.",
            price: `₹${menuData["Fast Food & Snacks"].find(item => item.name === "CHICKEN BURGER")?.price || "100"}`,
            rating: "4.8",
            eta: "15-20 mins",
            discount: "BOGO Offer",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
        },
        {
            id: "chicken-pizza",
            title: menuData["Fast Food & Snacks"].find(item => item.name === "CHICKEN PIZZA")?.name || "Chicken Pizza",
            restaurant: "The Biryani Canteen",
            description: "Thin crust pizza topped with spicy chicken and cheese.",
            price: `₹${menuData["Fast Food & Snacks"].find(item => item.name === "CHICKEN PIZZA")?.price || "100"}`,
            rating: "4.7",
            eta: "25-30 mins",
            discount: "Flat ₹30 OFF",
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop",
        },
        {
            id: "chicken-pasta",
            title: menuData["Chinese & Pasta"].find(item => item.name === "CHICKEN PASTA")?.name || "Chicken Pasta",
            restaurant: "The Biryani Canteen",
            description: "Creamy white sauce pasta with tender chicken bits.",
            price: `₹${menuData["Chinese & Pasta"].find(item => item.name === "CHICKEN PASTA")?.price || "80"}`,
            rating: "4.6",
            eta: "20-25 mins",
            image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop",
        },
        {
            id: "egg-chicken-roll",
            title: menuData["Rolls & Wraps"].find(item => item.name === "EGG CHICKEN ROLL")?.name || "Egg Chicken Roll",
            restaurant: "The Biryani Canteen",
            description: "Classic street-style paratha roll with egg and chicken.",
            price: `₹${menuData["Rolls & Wraps"].find(item => item.name === "EGG CHICKEN ROLL")?.price || "90"}`,
            rating: "4.9",
            eta: "10-15 mins",
            image: "https://images.unsplash.com/photo-1626777553754-5a7e6b015183?q=80&w=800&auto=format&fit=crop",
        },
        {
            id: "chicken-popcorn",
            title: menuData["Fast Food & Snacks"].find(item => item.name === "CHICKEN POPCORN (8 PCS)")?.name || "Chicken Popcorn (8 Pcs)",
            restaurant: "The Biryani Canteen",
            description: "Bite-sized crispy chicken munchies.",
            price: `₹${menuData["Fast Food & Snacks"].find(item => item.name === "CHICKEN POPCORN (8 PCS)")?.price || "100"}`,
            rating: "4.8",
            eta: "10-15 mins",
            image: "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&auto=format&fit=crop",
        },
        {
            id: "oreo-shake",
            title: menuData["Drinks & Beverages"].find(item => item.name === "OREO SHAKE")?.name || "Oreo Shake",
            restaurant: "The Biryani Canteen",
            description: "Thick chocolate shake blended with Oreo cookies.",
            price: `₹${menuData["Drinks & Beverages"].find(item => item.name === "OREO SHAKE")?.price || "100"}`,
            rating: "4.9",
            eta: "10-15 mins",
            image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop",
        },
    ];

    return (
        <section className="px-5 pb-6 overflow-hidden">
            <motion.div
                className="flex items-center justify-between mb-5"
            >
                <div>
                    <h3 className="text-slate-900 dark:text-slate-100 text-lg font-black tracking-tight">
                        Recommended for you
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Curated selections based on your taste</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-sm block">filter_list</span>
                </div>
            </motion.div>

            <div className="flex flex-col gap-5">
                {picks.map((item, index) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link
                            href={`/dish/${item.id}`}
                            className="group flex gap-4 bg-transparent transition-all duration-300"
                        >
                            {/* Image side */}
                            <div className="relative w-32 h-36 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                                <img
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    alt={item.title}
                                    src={item.image}
                                />
                                {/* Gradient for text readability */}
                                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                {/* Discount Overlays */}
                                <div className="absolute bottom-2 left-0 right-0 px-2 flex flex-col gap-0.5 z-10">
                                    {item.proDiscount && (
                                        <span className="text-[9px] font-bold text-red-100 bg-red-600/90 rounded px-1.5 py-0.5 uppercase tracking-wider w-fit mb-0.5">
                                            {item.proDiscount}
                                        </span>
                                    )}
                                    <span className="text-[13px] font-black text-white leading-tight drop-shadow-md">
                                        {item.discount}
                                    </span>
                                </div>

                                <div className="absolute top-2 right-2 bg-white/90 p-1 rounded-full shadow-sm">
                                    <span className="material-symbols-outlined text-[14px] text-slate-400 block group-hover:text-red-500 transition-colors">favorite</span>
                                </div>
                            </div>

                            {/* Details side */}
                            <div className="flex-1 flex flex-col justify-start py-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h6 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight pr-2">
                                        {item.title}
                                    </h6>
                                    <div className="flex items-center gap-0.5 bg-green-700 px-1.5 py-0.5 rounded shrink-0">
                                        <span className="text-[11px] font-bold text-white">
                                            {item.rating}
                                        </span>
                                        <span className="material-symbols-outlined text-[10px] text-white fill-1">
                                            star
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 truncate">
                                    {item.restaurant}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                                    {item.description}
                                </p>

                                <div className="flex items-center gap-2 mb-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px] text-slate-400 dark:text-slate-500">schedule</span>
                                        <span>{item.eta}</span>
                                    </div>
                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                    <span>2.5 km</span>
                                </div>

                                <div className="mt-auto flex items-center gap-2">
                                    <span className="font-black text-slate-900 dark:text-white text-sm">
                                        {item.price}
                                    </span>
                                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">
                                        FREE DELIVERY
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import menuData from "@/data/menu_clean.json";

const picks = [
    {
        id: "chicken-burger",
        name: menuData["Fast Food & Snacks"].find(i => i.name === "CHICKEN BURGER")?.name ?? "CHICKEN BURGER",
        price: menuData["Fast Food & Snacks"].find(i => i.name === "CHICKEN BURGER")?.price ?? "100",
        isVeg: false,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: "chicken-pizza",
        name: menuData["Fast Food & Snacks"].find(i => i.name === "CHICKEN PIZZA")?.name ?? "CHICKEN PIZZA",
        price: menuData["Fast Food & Snacks"].find(i => i.name === "CHICKEN PIZZA")?.price ?? "100",
        isVeg: false,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: "chicken-pasta",
        name: menuData["Chinese & Pasta"].find(i => i.name === "CHICKEN PASTA")?.name ?? "CHICKEN PASTA",
        price: menuData["Chinese & Pasta"].find(i => i.name === "CHICKEN PASTA")?.price ?? "80",
        isVeg: false,
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: "egg-chicken-roll",
        name: menuData["Rolls & Wraps"].find(i => i.name === "EGG CHICKEN ROLL")?.name ?? "EGG CHICKEN ROLL",
        price: menuData["Rolls & Wraps"].find(i => i.name === "EGG CHICKEN ROLL")?.price ?? "90",
        isVeg: false,
        image: "https://images.unsplash.com/photo-1626777553754-5a7e6b015183?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: "chicken-popcorn-8-pcs-",
        name: menuData["Fast Food & Snacks"].find(i => i.name === "CHICKEN POPCORN (8 PCS)")?.name ?? "CHICKEN POPCORN (8 PCS)",
        price: menuData["Fast Food & Snacks"].find(i => i.name === "CHICKEN POPCORN (8 PCS)")?.price ?? "100",
        isVeg: false,
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: "oreo-shake",
        name: menuData["Drinks & Beverages"].find(i => i.name === "OREO SHAKE")?.name ?? "OREO SHAKE",
        price: menuData["Drinks & Beverages"].find(i => i.name === "OREO SHAKE")?.price ?? "100",
        isVeg: true,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop",
    },
] as const;

export default function RoyalPicks() {
    return (
        <section className="px-5 pb-6 overflow-hidden">
            <motion.div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-slate-900 dark:text-slate-100 text-lg font-black tracking-tight">
                        Recommended for you
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Curated selections from our menu</p>
                </div>
            </motion.div>

            <div className="flex flex-col gap-5">
                {picks.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link
                            href={`/dish/${item.id}`}
                            className="group flex gap-4 bg-transparent transition-all duration-300"
                        >
                            <div className="relative w-32 h-28 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                                <img
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    alt={item.name}
                                    src={item.image}
                                />
                            </div>

                            <div className="flex-1 flex flex-col justify-center py-1">
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
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                                        {item.isVeg ? "Veg" : "Non-Veg"}
                                    </span>
                                </div>
                                <h6 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight mb-1">
                                    {item.name}
                                </h6>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-2">
                                    The Biryani Canteen
                                </p>
                                <span className="font-black text-[#002366] dark:text-primary text-sm">
                                    ₹{item.price}
                                </span>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

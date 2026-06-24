"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// These are the known category IDs from Petpooja — match DB categoryName exactly
const CATEGORIES = [
    { id: "All",                   name: "All",         image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2ETTHmFR_jr2Mr2sLruO_ND11eXdd70gUptq1Hb5YjUrgenGQERJxOnj4arOl2DonpEIKZgkyJ1v_nQc6mq-vczCP2OHOZ_uFSVxBTinJ4JAmhVkpQN5WdOJynXv0dXRCXw06dIKJKpZbIcLnY39M9lyXb7wKZDpJ2NDFghnD6aM0dWqdVAWau_5Bq6ocvM6jrCJ1cfOeN9cTLtg4aKxgbS4ubOa5Q-ULL-EcOAGk3NxsteD8MjIjoqjzu2o4eStlYQZnRWh8pVO4" },
    { id: "Biryani & Rice",        name: "Biryani",     image: "https://lh3.googleusercontent.com/aida-public/AB6AXuALHxVeoQp135l5733t5CcKGVriNpq8fo5pfnxtQfm4b4GpQ1VK3T6GrQUfCajgFCSwcf6YjzK-AceYZ4CL8l7oj-i-GuoGYm0H2tf9gIj31D5ZuxjZWA8efiohaZXP2hNgIJhirSIMvug9_ifNa1CQY_rO8LV3rz4wK9_r0bd6uldyM7gLBXgrzQKau2pmw_FWOyu7KWJ5L6jt_s40ARQ8DDRUi-UtVRvsA8hfz9BzmrnVVncgQihyr-1QX-aGOsIF0vao25sjeNq9" },
    { id: "Rolls & Wraps",         name: "Rolls",       image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAG_OR5gLFM4KMrz2mdmBJ801T_5Bx6aefkPENWFvwga_p9jRV_Sy7Q_L2vIbAptJWTLOuyA64fQFSZpTtaZFJ99MuBTCh7JiWP7Xm6U1IqkyOAdyBBxnKOQf3it_0RQWK7JB7txvg37k8Vpny2II7V_frFx28WALtq7Cw7xtMWbye8x7WvorbF-iVseM2_pHfj-EHO4dLrSeSKij-ExtKAypG9-DnveV8ZYCF6VmeJOWAYu2yEfF3lcyckuXofOQthClb6TH1nqihV" },
    { id: "Veg Burgers",           name: "Burgers",     image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDoRRnuIzQvtkLQj4hdAUFSL3MIVVTFwXayko-DSkPKI3nyyUUsP5vl59ENHVuObx6H6_sbSHpTDJ5sALDLBnD1_KzV4zoZ7NItuJHyNlEE7hrUJXmqQVVHKdj99x-AGaOyxywv63G3DBU48GbkgBHVopU-yA4vg07fN9qVew0xspjnDgZVkpY6Qjzi24bVEF8Luu_SKOGmgtQAwVAAFDdlrnfSre2P0Fv0nFLo2Dkc-sZY-GNWEWsiGHhaG6agFwui9NACDmlEmAPA" },
    { id: "Veg Pizza",             name: "Pizza",       image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=200" },
    { id: "Veg Pasta",             name: "Pasta",       image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=200" },
    { id: "Shakes",                name: "Shakes",      image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=200" },
    { id: "Sides & Snacks",        name: "Snacks",      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB714WIhZ9p_KwN73Gap25A4b-H8Dj1cDDhnZ1MtU9AMQn2dRzcGQQMKDowqYcAQzvDOCOAjifl1a-wflhtza8Y61E-SfjcgU9CpP2_A9THNimp54h-sHXnCKLfwu4A_IxyKolcCQeZqbILIOLFsg68xFYFowumyYAau-B4gZrG7-uTBsjtuqqkKiinIicE_c-ryLmdhE7Q6maxnvayYk_2CWpUQulIPB0pu-41so0M6_sWWfJ7zcBM0Cr3THbo6H2Nve4DafMWfVzA" },
];

function CategoryStyleContent() {
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get("category") ?? "All";

    return (
        <section className="pt-2 pb-6 overflow-hidden bg-white dark:bg-slate-950">
            <div className="flex items-center gap-4 px-2 overflow-x-auto scrollbar-hide py-3 snap-x relative">
                {/* Spacer to prevent left cut-off on mobile */}
                <div className="w-2 shrink-0" />

                {/* Special Offer Tile */}
                <Link href="/menu?maxPrice=150">
                    <motion.div
                        whileHover={{ y: -2 }}
                        className="flex flex-col items-center justify-center min-w-[88px] shrink-0 snap-start cursor-pointer group"
                    >
                        <div className="w-full h-[72px] bg-[#0A2647] dark:bg-royal-blue rounded-2xl flex flex-col items-center justify-center text-white shadow-md relative overflow-hidden group-hover:shadow-lg transition-shadow border border-white/10 mb-6">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                            <span className="text-[7px] font-black uppercase tracking-widest mb-0.5 z-10 text-white">Meals Under</span>
                            <span className="text-xl font-black z-10 text-primary drop-shadow-md">₹150</span>
                            <div className="text-[7px] bg-white text-[#0A2647] px-2 py-0.5 rounded-full mt-1 font-black z-10 flex items-center shadow-lg">
                                EXPLORE <span className="material-symbols-outlined text-[8px] ml-0.5 font-black">chevron_right</span>
                            </div>
                        </div>
                    </motion.div>
                </Link>

                {/* Category Thumbnails */}
                {CATEGORIES.map((category) => {
                    const isActive = activeCategory === category.id;
                    return (
                        <motion.div
                            key={category.id}
                            whileHover={{ y: -2 }}
                            className="flex flex-col items-center justify-start min-w-[72px] shrink-0 snap-start cursor-pointer relative group"
                        >
                            <Link
                                href={category.id === "All" ? "/menu" : `/menu?category=${encodeURIComponent(category.id)}`}
                                className="flex flex-col items-center w-full focus:outline-none"
                            >
                                <div className={`w-[72px] h-[72px] rounded-full overflow-hidden shadow-xl mb-2 border-2 transition-all duration-300 bg-white ${isActive ? "border-terracotta shadow-terracotta/30 scale-105" : "border-slate-100 dark:border-slate-800 group-hover:border-primary"}`}>
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                                    />
                                </div>
                                <span className={`text-[11px] font-black uppercase tracking-tighter transition-colors ${isActive ? "text-terracotta dark:text-terracotta" : "text-slate-800 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white"}`}>
                                    {category.name}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="category-indicator"
                                        className="absolute -bottom-1 w-6 h-0.5 bg-terracotta rounded-full shadow-[0_1px_3px_rgba(189,84,49,0.4)]"
                                    />
                                )}
                            </Link>
                        </motion.div>
                    );
                })}
                {/* Spacer to prevent right cut-off on mobile */}
                <div className="w-2 shrink-0" />
            </div>
        </section>
    );
}

export default function CategoryStyle() {
    return (
        <Suspense fallback={<div className="h-24 bg-white dark:bg-slate-950" />}>
            <CategoryStyleContent />
        </Suspense>
    );
}

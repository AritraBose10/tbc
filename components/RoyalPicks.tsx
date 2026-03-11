"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function RoyalPicks() {
    const picks = [
        {
            id: "malai-paneer",
            title: "Malai Paneer Tikka",
            restaurant: "The Biryani Canteen HQ",
            description: "Creamy cubes of cottage cheese grilled in tandoor.",
            price: "₹280",
            rating: "4.8",
            eta: "30-35 mins",
            discount: "50% OFF up to ₹100",
            proDiscount: "Pro extra 10% OFF",
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAG_OR5gLFM4KMrz2mdmBJ801T_5Bx6aefkPENWFvwga_p9jRV_Sy7Q_L2vIbAptJWTLOuyA64fQFSZpTtaZFJ99MuBTCh7JiWP7Xm6U1IqkyOAdyBBxnKOQf3it_0RQWK7JB7txvg37k8Vpny2II7V_frFx28WALtq7Cw7xtMWbye8x7WvorbF-iVseM2_pHfj-EHO4dLrSeSKij-ExtKAypG9-DnveV8ZYCF6VmeJOWAYu2yEfF3lcyckuXofOQthClb6TH1nqihV",
        },
        {
            id: "mirchi-salan",
            title: "Mirchi ka Salan",
            restaurant: "TBC Express",
            description: "Peanut based spicy green chili gravy - a classic side.",
            price: "₹150",
            rating: "4.5",
            eta: "20-25 mins",
            discount: "Flat ₹50 OFF",
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDoRRnuIzQvtkLQj4hdAUFSL3MIVVTFwXayko-DSkPKI3nyyUUsP5vl59ENHVuObx6H6_sbSHpTDJ5sALDLBnD1_KzV4zoZ7NItuJHyNlEE7hrUJXmqQVVHKdj99x-AGaOyxywv63G3DBU48GbkgBHVopU-yA4vg07fN9qVew0xspjnDgZVkpY6Qjzi24bVEF8Luu_SKOGmgtQAwVAAFDdlrnfSre2P0Fv0nFLo2Dkc-sZY-GNWEWsiGHhaG6agFwui9NACDmlEmAPA",
        },
        {
            id: "butter-chicken",
            title: "Butter Chicken",
            restaurant: "TBC Premium Kitchen",
            description: "Tender chicken in a rich, creamy tomato-butter gravy.",
            price: "₹320",
            rating: "4.9",
            eta: "25-30 mins",
            discount: "30% OFF up to ₹75",
            proDiscount: "Pro extra 15% OFF",
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBTSTaAtWpvk57WUrC3rRzL1mZhiwmD8OVBx5PqaSI3nLdVfEiSjUHZ4GEx1-4hoxLKXiSf3aArh-zu1g7NYf8y5j2n7gD1T9MJD8BO6kNeOkCsHrdb4OTQYZH6cmMEBMfh2COZtxwsX9ry-NURYUhTDYy4HK79uhDfeOXrMH5qN_toN8HVf5Y4CZDPYiUuOWz9wqkmtz-S3Yy6iZ47FMhXBx_8GYK_JHbh9mcoh-XjNO0KpoOurWU39FMvLNLsF7l4Kuy5o0cv5vfn",
        },
        {
            id: "hyderabadi-biryani",
            title: "Hyderabadi Dum Biryani",
            restaurant: "The Biryani Canteen HQ",
            description: "Authentic slow-cooked basmati rice layered with aromatic spices.",
            price: "₹350",
            rating: "4.9",
            eta: "35-40 mins",
            discount: "Flat ₹80 OFF",
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuALHxVeoQp135l5733t5CcKGVriNpq8fo5pfnxtQfm4b4GpQ1VK3T6GrQUfCajgFCSwcf6YjzK-AceYZ4CL8l7oj-i-GuoGYm0H2tf9gIj31D5ZuxjZWA8efiohaZXP2hNgIJhirSIMvug9_ifNa1CQY_rO8LV3rz4wK9_r0bd6uldyM7gLBXgrzQKau2pmw_FWOyu7KWJ5L6jt_s40ARQ8DDRUi-UtVRvsA8hfz9BzmrnVVncgQihyr-1QX-aGOsIF0vao25sjeNq9",
        },
        {
            id: "chicken-65",
            title: "Chicken 65",
            restaurant: "TBC Express",
            description: "Spicy, deep-fried chicken bites with curry leaves.",
            price: "₹220",
            rating: "4.6",
            eta: "15-20 mins",
            discount: "20% OFF",
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuB714WIhZ9p_KwN73Gap25A4b-H8Dj1cDDhnZ1MtU9AMQn2dRzcGQQMKDowqYcAQzvDOCOAjifl1a-wflhtza8Y61E-SfjcgU9CpP2_A9THNimp54h-sHXnCKLfwu4A_IxyKolcCQeZqbILIOLFsg68xFYFowumyYAau-B4gZrG7-uTBsjtuqqkKiinIicE_c-ryLmdhE7Q6maxnvayYk_2CWpUQulIPB0pu-41so0M6_sWWfJ7zcBM0Cr3THbo6H2Nve4DafMWfVzA",
        },
        {
            id: "veg-pulao",
            title: "Vegetable Pulao",
            restaurant: "TBC Lite",
            description: "Fragrant basmati rice cooked with garden-fresh vegetables.",
            price: "₹180",
            rating: "4.4",
            eta: "20-25 mins",
            discount: "Flat ₹30 OFF",
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuD2ETTHmFR_jr2Mr2sLruO_ND11eXdd70gUptq1Hb5YjUrgenGQERJxOnj4arOl2DonpEIKZgkyJ1v_nQc6mq-vczCP2OHOZ_uFSVxBTinJ4JAmhVkpQN5WdOJynXv0dXRCXw06dIKJKpZbIcLnY39M9lyXb7wKZDpJ2NDFghnD6aM0dWqdVAWau_5Bq6ocvM6jrCJ1cfOeN9cTLtg4aKxgbS4ubOa5Q-ULL-EcOAGk3NxsteD8MjIjoqjzu2o4eStlYQZnRWh8pVO4",
        },
    ];

    return (
        <section className="px-5 pb-6 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
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
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-20px" }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
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

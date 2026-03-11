"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ChefSpecials() {
    const specials = [
        {
            id: "nawabi-tarkari",
            title: "Nawabi Tarkari Biryani",
            restaurant: "The Biryani Canteen",
            description: "Garden fresh vegetables layered with long grain basmati.",
            price: "₹299",
            rating: "4.7",
            eta: "35-40 mins",
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuALHxVeoQp135l5733t5CcKGVriNpq8fo5pfnxtQfm4b4GpQ1VK3T6GrQUfCajgFCSwcf6YjzK-AceYZ4CL8l7oj-i-GuoGYm0H2tf9gIj31D5ZuxjZWA8efiohaZXP2hNgIJhirSIMvug9_ifNa1CQY_rO8LV3rz4wK9_r0bd6uldyM7gLBXgrzQKau2pmw_FWOyu7KWJ5L6jt_s40ARQ8DDRUi-UtVRvsA8hfz9BzmrnVVncgQihyr-1QX-aGOsIF0vao25sjeNq9",
            badge: "MUST TRY",
            discount: "Flat ₹75 OFF"
        },
        {
            id: "mutton-raan",
            title: "Slow Roasted Mutton",
            restaurant: "TBC Premium",
            description: "Whole leg of lamb, spiced for 24 hours and slow cooked.",
            price: "₹550",
            rating: "4.9",
            eta: "45-50 mins",
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBTSTaAtWpvk57WUrC3rRzL1mZhiwmD8OVBx5PqaSI3nLdVfEiSjUHZ4GEx1-4hoxLKXiSf3aArh-zu1g7NYf8y5j2n7gD1T9MJD8BO6kNeOkCsHrdb4OTQYZH6cmMEBMfh2COZtxwsX9ry-NURYUhTDYy4HK79uhDfeOXrMH5qN_toN8HVf5Y4CZDPYiUuOWz9wqkmtz-S3Yy6iZ47FMhXBx_8GYK_JHbh9mcoh-XjNO0KpoOurWU39FMvLNLsF7l4Kuy5o0cv5vfn",
            badge: "BESTSELLER",
            proDiscount: "Pro extra 15% OFF"
        },
        {
            id: "keema-samosa",
            title: "Royal Keema Samosa",
            restaurant: "TBC Snacks",
            description: "Crispy samosas stuffed with seasoned minced meat & spices.",
            price: "₹120",
            rating: "4.6",
            eta: "15-20 mins",
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAG_OR5gLFM4KMrz2mdmBJ801T_5Bx6aefkPENWFvwga_p9jRV_Sy7Q_L2vIbAptJWTLOuyA64fQFSZpTtaZFJ99MuBTCh7JiWP7Xm6U1IqkyOAdyBBxnKOQf3it_0RQWK7JB7txvg37k8Vpny2II7V_frFx28WALtq7Cw7xtMWbye8x7WvorbF-iVseM2_pHfj-EHO4dLrSeSKij-ExtKAypG9-DnveV8ZYCF6VmeJOWAYu2yEfF3lcyckuXofOQthClb6TH1nqihV",
            badge: "NEW",
            discount: "25% OFF"
        },
        {
            id: "dal-makhani",
            title: "Dal Makhani",
            restaurant: "The Biryani Canteen",
            description: "Black lentils simmered overnight in butter & cream.",
            price: "₹199",
            rating: "4.8",
            eta: "25-30 mins",
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDoRRnuIzQvtkLQj4hdAUFSL3MIVVTFwXayko-DSkPKI3nyyUUsP5vl59ENHVuObx6H6_sbSHpTDJ5sALDLBnD1_KzV4zoZ7NItuJHyNlEE7hrUJXmqQVVHKdj99x-AGaOyxywv63G3DBU48GbkgBHVopU-yA4vg07fN9qVew0xspjnDgZVkpY6Qjzi24bVEF8Luu_SKOGmgtQAwVAAFDdlrnfSre2P0Fv0nFLo2Dkc-sZY-GNWEWsiGHhaG6agFwui9NACDmlEmAPA",
            badge: "CHEF PICK",
            discount: "Flat ₹40 OFF"
        },
        {
            id: "tandoori-platter",
            title: "Tandoori Platter",
            restaurant: "TBC Premium",
            description: "Assorted tandoori kebabs with mint chutney & onion rings.",
            price: "₹450",
            rating: "4.7",
            eta: "30-35 mins",
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuB714WIhZ9p_KwN73Gap25A4b-H8Dj1cDDhnZ1MtU9AMQn2dRzcGQQMKDowqYcAQzvDOCOAjifl1a-wflhtza8Y61E-SfjcgU9CpP2_A9THNimp54h-sHXnCKLfwu4A_IxyKolcCQeZqbILIOLFsg68xFYFowumyYAau-B4gZrG7-uTBsjtuqqkKiinIicE_c-ryLmdhE7Q6maxnvayYk_2CWpUQulIPB0pu-41so0M6_sWWfJ7zcBM0Cr3THbo6H2Nve4DafMWfVzA",
            badge: "PREMIUM",
            proDiscount: "Pro extra 20% OFF"
        },
    ];

    return (
        <section className="py-6 px-5 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center justify-between mb-5"
            >
                <div>
                    <h3 className="text-slate-900 dark:text-slate-100 text-lg font-black tracking-tight">
                        Chef&apos;s Specials
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Handcrafted masterpieces</p>
                </div>
                <Link href="/dish/all" className="text-xs font-bold text-red-600 dark:text-red-400">See all</Link>
            </motion.div>

            <motion.div
                drag="x"
                dragConstraints={{ left: -600, right: 0 }}
                className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide cursor-grab active:cursor-grabbing"
            >
                {specials.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
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

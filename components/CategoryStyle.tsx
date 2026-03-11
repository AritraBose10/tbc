"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CategoryStyle() {
    const categories = [
        {
            id: "all",
            name: "All",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2ETTHmFR_jr2Mr2sLruO_ND11eXdd70gUptq1Hb5YjUrgenGQERJxOnj4arOl2DonpEIKZgkyJ1v_nQc6mq-vczCP2OHOZ_uFSVxBTinJ4JAmhVkpQN5WdOJynXv0dXRCXw06dIKJKpZbIcLnY39M9lyXb7wKZDpJ2NDFghnD6aM0dWqdVAWau_5Bq6ocvM6jrCJ1cfOeN9cTLtg4aKxgbS4ubOa5Q-ULL-EcOAGk3NxsteD8MjIjoqjzu2o4eStlYQZnRWh8pVO4",
            active: true
        },
        {
            id: "biryani",
            name: "Biryani",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuALHxVeoQp135l5733t5CcKGVriNpq8fo5pfnxtQfm4b4GpQ1VK3T6GrQUfCajgFCSwcf6YjzK-AceYZ4CL8l7oj-i-GuoGYm0H2tf9gIj31D5ZuxjZWA8efiohaZXP2hNgIJhirSIMvug9_ifNa1CQY_rO8LV3rz4wK9_r0bd6uldyM7gLBXgrzQKau2pmw_FWOyu7KWJ5L6jt_s40ARQ8DDRUi-UtVRvsA8hfz9BzmrnVVncgQihyr-1QX-aGOsIF0vao25sjeNq9",
            active: false
        },
        {
            id: "chicken",
            name: "Chicken",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAG_OR5gLFM4KMrz2mdmBJ801T_5Bx6aefkPENWFvwga_p9jRV_Sy7Q_L2vIbAptJWTLOuyA64fQFSZpTtaZFJ99MuBTCh7JiWP7Xm6U1IqkyOAdyBBxnKOQf3it_0RQWK7JB7txvg37k8Vpny2II7V_frFx28WALtq7Cw7xtMWbye8x7WvorbF-iVseM2_pHfj-EHO4dLrSeSKij-ExtKAypG9-DnveV8ZYCF6VmeJOWAYu2yEfF3lcyckuXofOQthClb6TH1nqihV",
            active: false
        },
        {
            id: "burger",
            name: "Burger",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDoRRnuIzQvtkLQj4hdAUFSL3MIVVTFwXayko-DSkPKI3nyyUUsP5vl59ENHVuObx6H6_sbSHpTDJ5sALDLBnD1_KzV4zoZ7NItuJHyNlEE7hrUJXmqQVVHKdj99x-AGaOyxywv63G3DBU48GbkgBHVopU-yA4vg07fN9qVew0xspjnDgZVkpY6Qjzi24bVEF8Luu_SKOGmgtQAwVAAFDdlrnfSre2P0Fv0nFLo2Dkc-sZY-GNWEWsiGHhaG6agFwui9NACDmlEmAPA",
            active: false
        },
        {
            id: "kebabs",
            name: "Kebabs",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB714WIhZ9p_KwN73Gap25A4b-H8Dj1cDDhnZ1MtU9AMQn2dRzcGQQMKDowqYcAQzvDOCOAjifl1a-wflhtza8Y61E-SfjcgU9CpP2_A9THNimp54h-sHXnCKLfwu4A_IxyKolcCQeZqbILIOLFsg68xFYFowumyYAau-B4gZrG7-uTBsjtuqqkKiinIicE_c-ryLmdhE7Q6maxnvayYk_2CWpUQulIPB0pu-41so0M6_sWWfJ7zcBM0Cr3THbo6H2Nve4DafMWfVzA",
            active: false
        },
        {
            id: "desserts",
            name: "Desserts",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTSTaAtWpvk57WUrC3rRzL1mZhiwmD8OVBx5PqaSI3nLdVfEiSjUHZ4GEx1-4hoxLKXiSf3aArh-zu1g7NYf8y5j2n7gD1T9MJD8BO6kNeOkCsHrdb4OTQYZH6cmMEBMfh2COZtxwsX9ry-NURYUhTDYy4HK79uhDfeOXrMH5qN_toN8HVf5Y4CZDPYiUuOWz9wqkmtz-S3Yy6iZ47FMhXBx_8GYK_JHbh9mcoh-XjNO0KpoOurWU39FMvLNLsF7l4Kuy5o0cv5vfn",
            active: false
        },
        {
            id: "drinks",
            name: "Drinks",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2ETTHmFR_jr2Mr2sLruO_ND11eXdd70gUptq1Hb5YjUrgenGQERJxOnj4arOl2DonpEIKZgkyJ1v_nQc6mq-vczCP2OHOZ_uFSVxBTinJ4JAmhVkpQN5WdOJynXv0dXRCXw06dIKJKpZbIcLnY39M9lyXb7wKZDpJ2NDFghnD6aM0dWqdVAWau_5Bq6ocvM6jrCJ1cfOeN9cTLtg4aKxgbS4ubOa5Q-ULL-EcOAGk3NxsteD8MjIjoqjzu2o4eStlYQZnRWh8pVO4",
            active: false
        },
    ];

    return (
        <section className="pt-2 pb-6 overflow-hidden">
            <div className="flex gap-4 px-5 overflow-x-auto scrollbar-hide py-2 snap-x relative">
                {/* Special Offer Tile */}
                <Link href="/dish/all">
                    <motion.div
                        whileHover={{ y: -2 }}
                        className="flex flex-col items-center justify-center min-w-[80px] shrink-0 snap-start cursor-pointer group"
                    >
                        <div className="w-[84px] h-20 bg-gradient-to-br from-royal-blue to-blue-800 rounded-2xl flex flex-col items-center justify-center text-white shadow-md relative overflow-hidden group-hover:shadow-lg transition-shadow border border-royal-blue/30">
                            {/* Jagged edge effect mock */}
                            <div className="absolute -top-1 left-0 w-full flex justify-around opacity-20">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="w-2 h-2 bg-white rotate-45" />
                                ))}
                            </div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
                            <span className="text-[8px] font-bold uppercase tracking-widest mb-0.5 z-10 opacity-90">Meals Under</span>
                            <span className="text-xl font-black z-10 drop-shadow-sm">₹250</span>
                            <div className="text-[8px] bg-white text-royal-blue px-2 py-0.5 rounded-full mt-1.5 font-bold z-10 flex items-center shadow-sm">
                                Explore <span className="material-symbols-outlined text-[10px] ml-0.5">chevron_right</span>
                            </div>
                        </div>
                    </motion.div>
                </Link>

                {/* Category Thumbnails */}
                {categories.map((category, index) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        whileHover={{ y: -2 }}
                        className="flex flex-col items-center justify-start min-w-[72px] shrink-0 snap-start cursor-pointer relative group"
                    >
                        <Link href={`/dish/${category.id}`} className="flex flex-col items-center w-full">
                            <div className={`w-[72px] h-[72px] rounded-full overflow-hidden shadow-sm shadow-black/10 mb-2 border-2 ${category.active ? 'border-transparent' : 'border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700'} transition-all`}>
                                <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <span className={`text-xs font-bold ${category.active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                {category.name}
                            </span>
                            {category.active && (
                                <motion.div
                                    layoutId="category-indicator"
                                    className="absolute -bottom-2 w-8 h-0.5 bg-terracotta rounded-full"
                                />
                            )}
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

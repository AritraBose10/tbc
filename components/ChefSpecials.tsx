"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";

interface MenuItem {
    petpoojaId: string;
    name: string;
    price: number;
    categoryName: string;
    isVeg: boolean;
}

const CATEGORY_IMAGES: Record<string, string> = {
    "Biryani & Rice":        "https://images.unsplash.com/photo-1563379091339-03b11adca53b?q=80&w=800&auto=format&fit=crop",
    "Rolls & Wraps":         "https://images.unsplash.com/photo-1626777553754-5a7e6b015183?q=80&w=800&auto=format&fit=crop",
    "Veg Burgers":           "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    "Chicken Burgers":       "https://images.unsplash.com/photo-1603064752734-4c48eff53d05?q=80&w=800&auto=format&fit=crop",
    "Chicken Burger Combos": "https://images.unsplash.com/photo-1603064752734-4c48eff53d05?q=80&w=800&auto=format&fit=crop",
    "Veg Burger Meals":      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    "Veg Burger Combos":     "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    "Veg Burger Value Meals":"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    "Chicken Burger Meals":  "https://images.unsplash.com/photo-1603064752734-4c48eff53d05?q=80&w=800&auto=format&fit=crop",
    "Veg Pizza":             "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop",
    "Chicken Pizza":         "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop",
    "Veg Pasta":             "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop",
    "Chicken Pasta":         "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=800&auto=format&fit=crop",
    "Pasta Combos":          "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop",
    "Garlic Bread":          "https://images.unsplash.com/photo-1619740455993-9d622ff25b8e?q=80&w=800&auto=format&fit=crop",
    "Garlic Bread Combos":   "https://images.unsplash.com/photo-1619740455993-9d622ff25b8e?q=80&w=800&auto=format&fit=crop",
    "Shakes":                "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop",
    "Cold Coffee":           "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop",
    "Hot Coffee":            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop",
    "Espresso":              "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=800&auto=format&fit=crop",
    "Iced Coffee":           "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop",
    "Hot Beverages":         "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=800&auto=format&fit=crop",
    "Mocktails":             "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop",
    "Smoothies":             "https://images.unsplash.com/photo-1610970881699-44a5587cabec?q=80&w=800&auto=format&fit=crop",
    "Sides & Snacks":        "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&auto=format&fit=crop",
    "Chicken Snacks":        "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&auto=format&fit=crop",
    "Veg Salads":            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
    "Chicken Salads":        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop",
    "Garden Salads":         "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
    "Sweets & Desserts":     "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800&auto=format&fit=crop",
    "Bakery & Desserts":     "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop",
    "Veg Pita":              "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop",
    "Chicken Pita":          "https://images.unsplash.com/photo-1589187151003-8dc9c058778f?q=80&w=800&auto=format&fit=crop",
    "Veg Rice Bowls":        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop",
    "Chicken Rice Bowls":    "https://images.unsplash.com/photo-1603894584373-5ac82b0f5013?q=80&w=800&auto=format&fit=crop",
    "Pita Pizzas":           "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop",
    "Health Add-ons":        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop";

function getImage(categoryName: string) {
    return CATEGORY_IMAGES[categoryName] ?? DEFAULT_IMAGE;
}

export default function ChefSpecials() {
    const { addItem } = useCartStore();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/menu")
            .then((r) => r.json())
            .then((data: MenuItem[]) => {
                // One item per unique image
                const seen = new Set<string>();
                const visuallyDistinct = data.filter(item => {
                    if (!item.categoryName) return false;
                    const img = getImage(item.categoryName);
                    if (seen.has(img)) return false;
                    seen.add(img);
                    return true;
                }).slice(0, 6);
                setItems(visuallyDistinct);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

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
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="min-w-[220px] snap-center bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse">
                              <div className="h-36 bg-slate-200 dark:bg-slate-700" />
                              <div className="p-3.5 space-y-2">
                                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                                  <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded mt-3" />
                              </div>
                          </div>
                      ))
                    : items.map((item, index) => (
                          <motion.div
                              key={item.petpoojaId}
                              whileHover={{ y: -4, transition: { duration: 0.25 } }}
                              className="min-w-[220px] snap-center bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800"
                          >
                              <Link href={`/dish/${item.petpoojaId}`} className="block">
                                  <div className="relative h-36 overflow-hidden">
                                      <img
                                          className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                                          alt={item.name}
                                          src={getImage(item.categoryName)}
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
                                          {item.name}
                                      </h5>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3 truncate">
                                          {item.categoryName}
                                      </p>

                                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                                          <div className="flex flex-col">
                                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Price</span>
                                              <span className="text-slate-900 dark:text-white font-black text-sm">₹{item.price}</span>
                                          </div>
                                          <motion.button
                                              onClick={(e: React.MouseEvent) => {
                                                  e.preventDefault();
                                                  addItem({
                                                      id: item.petpoojaId,
                                                      name: item.name,
                                                      price: item.price,
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

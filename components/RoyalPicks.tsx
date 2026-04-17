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

// Shared category → image map (keep in sync with ChefSpecials)
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
const getImage = (cat: string) => CATEGORY_IMAGES[cat] ?? DEFAULT_IMAGE;

export default function RoyalPicks() {
    const { addItem } = useCartStore();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/menu")
            .then((r) => r.json())
            .then((data: MenuItem[]) => {
                // One item per unique image, skip first 6 (shown in ChefSpecials)
                const seen = new Set<string>();
                const visuallyDistinct = data.filter(item => {
                    if (!item.categoryName) return false;
                    const img = getImage(item.categoryName);
                    if (seen.has(img)) return false;
                    seen.add(img);
                    return true;
                }).slice(6, 12);
                setItems(visuallyDistinct);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="px-5 pb-6 overflow-hidden">
            <motion.div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-xl font-extrabold tracking-tight" style={{ color: "#002366" }}>
                        Recommended for you
                    </h3>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: "#475569" }}>
                        Curated selections from our menu
                    </p>
                </div>
                <Link href="/menu" className="text-xs font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-full shadow-sm hover:bg-red-100 transition-colors">
                    See all
                </Link>
            </motion.div>

            <div className="flex flex-col gap-4">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex gap-4 rounded-2xl p-3 shadow-sm border border-slate-200 bg-white animate-pulse">
                              <div className="w-24 h-24 rounded-xl bg-slate-200 shrink-0" />
                              <div className="flex-1 space-y-2 py-2">
                                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                                  <div className="h-3 bg-slate-100 rounded w-1/4 mt-2" />
                              </div>
                          </div>
                      ))
                    : items.map((item, index) => (
                          <motion.div key={item.petpoojaId} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                              <div className="group flex gap-4 rounded-2xl p-3 shadow-sm border border-slate-200 bg-white transition-all duration-300 hover:shadow-md">
                                  <Link href={`/dish/${item.petpoojaId}`} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                                      <img
                                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                          alt={item.name}
                                          src={getImage(item.categoryName)}
                                      />
                                  </Link>

                                  <div className="flex-1 flex flex-col justify-center py-1">
                                      <div className="flex items-center gap-2 mb-1">
                                          <span
                                              className="w-3 h-3 border flex-shrink-0 flex items-center justify-center p-[2px]"
                                              style={{ borderColor: item.isVeg ? "#16a34a" : "#dc2626" }}
                                          >
                                              <div className="w-full h-full rounded-full" style={{ backgroundColor: item.isVeg ? "#16a34a" : "#dc2626" }} />
                                          </span>
                                          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: item.isVeg ? "#16a34a" : "#dc2626" }}>
                                              {item.isVeg ? "Veg" : "Non-Veg"}
                                          </span>
                                      </div>
                                      <h6 className="font-extrabold text-sm leading-tight mb-1" style={{ color: "#111827" }}>
                                          {item.name}
                                      </h6>
                                      <p className="text-xs font-medium mb-2" style={{ color: "#6b7280" }}>
                                          {item.categoryName}
                                      </p>
                                      <div className="flex items-center justify-between">
                                          <span className="font-black text-sm" style={{ color: "#002366" }}>
                                              ₹{item.price}
                                          </span>
                                          <motion.button
                                              onClick={() => addItem({ id: item.petpoojaId, name: item.name, price: item.price, quantity: 1 })}
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                              className="text-[11px] font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
                                          >
                                              ADD
                                          </motion.button>
                                      </div>
                                  </div>
                              </div>
                          </motion.div>
                      ))}
            </div>
        </section>
    );
}

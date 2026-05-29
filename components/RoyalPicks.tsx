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
    "Biryani Special":        "https://plus.unsplash.com/premium_photo-1694141252774-c937d97641da?q=80&w=800&auto=format&fit=crop",
    "Kathi Rolls":            "https://images.unsplash.com/photo-1626777553754-5a7e6b015183?q=80&w=800&auto=format&fit=crop",
    "Burgers":                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    "Pizzas":                 "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop",
    "Pastas":                 "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop",
    "Milkshakes":             "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop",
    "Hot Beverages":          "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=800&auto=format&fit=crop",
    "Mocktails & Cold Drinks":"https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop",
    "Veg Starters":           "https://images.unsplash.com/photo-1775717427684-75b886ebbfc9?q=80&w=800&auto=format&fit=crop",
    "Non-Veg Starters":       "https://plus.unsplash.com/premium_photo-1692835647026-9d309b143fc7?q=80&w=800&auto=format&fit=crop",
    "Desserts":               "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800&auto=format&fit=crop",
    "Royal Thalis":           "https://images.unsplash.com/photo-1680993032090-1ef7ea9b51e5?q=80&w=800&auto=format&fit=crop",
    "Combos & Platters":      "https://images.unsplash.com/photo-1542367592-8849eb950fd8?q=80&w=800&auto=format&fit=crop",
    "Noodles":                "https://plus.unsplash.com/premium_photo-1694547926001-f2151e4a476b?q=80&w=800&auto=format&fit=crop",
    "Maggi Special":          "https://images.unsplash.com/photo-1612966608967-312ba599102e?q=80&w=800&auto=format&fit=crop",
    "Indian Breads":          "https://images.unsplash.com/photo-1585562230631-a122e231666c?q=80&w=800&auto=format&fit=crop",
    "Dal Corner":             "https://plus.unsplash.com/premium_photo-1700673590238-a0e3a3795ae2?q=80&w=800&auto=format&fit=crop",
    "Main Course":            "https://plus.unsplash.com/premium_photo-1723708871094-2c02cf5f5394?q=80&w=800&auto=format&fit=crop",
    "Sandwiches":             "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?q=80&w=800&auto=format&fit=crop",
    "Wraps":                  "https://images.unsplash.com/photo-1778168199427-4e839943d20f?q=80&w=800&auto=format&fit=crop",
    "Momos":                  "https://plus.unsplash.com/premium_photo-1673769108070-580fe90b8de7?q=80&w=800&auto=format&fit=crop",
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
                const seen = new Set<string>();
                const visuallyDistinct = [...data]
                    .sort((a, b) => b.price - a.price)
                    .filter(item => {
                        if (!item.categoryName) return false;
                        const img = getImage(item.categoryName);
                        if (seen.has(img)) return false;
                        seen.add(img);
                        return true;
                    })
                    .slice(0, 6);
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
                    : items.map((item) => (
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

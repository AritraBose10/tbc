"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const MenuItem = ({ icon, title, subtitle, href }: { icon: string; title: string; subtitle?: string; href: string }) => (
    <Link href={href}>
        <motion.div
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/80 rounded-2xl mb-3 premium-shadow border border-slate-50 dark:border-slate-800"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">{title}</h3>
                    {subtitle && <p className="text-[10px] text-slate-500 dark:text-slate-400">{subtitle}</p>}
                </div>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
        </motion.div>
    </Link>
);

export default function Profile() {
    return (
        <main className="min-h-screen bg-[#FFFDF0] dark:bg-background-dark pb-28 mughal-pattern font-display">
            {/* Profile Header */}
            <div className="px-5 pt-10 pb-20 bg-[#0A2647] dark:bg-slate-950 relative overflow-hidden rounded-b-[40px]">
                {/* Background Pattern/Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-terracotta/10 rounded-full blur-[80px] -ml-24 -mb-24" />

                <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 rounded-full border-4 border-white/20 p-1 mb-4 relative"
                    >
                        <div className="w-full h-full rounded-full overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-royal-blue rounded-full border-2 border-[#0A2647] flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-sm">photo_camera</span>
                        </motion.button>
                    </motion.div>

                    <motion.h2
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl font-black text-white tracking-tight"
                    >
                        Royal Foodie
                    </motion.h2>
                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-sm"
                    >
                        foodie@royalhaat.com
                    </motion.p>

                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex gap-4 mt-6"
                    >
                        <div className="text-center">
                            <p className="text-white font-black text-lg">12</p>
                            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Orders</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <p className="text-white font-black text-lg">450</p>
                            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Points</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <p className="text-white font-black text-lg">₹1.2k</p>
                            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Spent</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="px-5 -mt-10 relative z-20">
                {/* Recent Order Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-slate-900 p-4 rounded-3xl premium-shadow ring-1 ring-slate-100 dark:ring-slate-800 mb-8"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-widest">Active Order</h3>
                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">On the Way</span>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 italic text-[10px] flex items-center justify-center text-slate-400">
                            <img src="https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&q=80&w=100" alt="Biryani" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Chicken Dum Biryani (Large)</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Order #RHA-3940 • ₹185.00</p>
                            <div className="mt-3">
                                <Link href="/track" className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    Track Live Location <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Settings Menu */}
                <div className="space-y-1">
                    <h3 className="font-black text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest ml-4 mb-3">Account Settings</h3>
                    <MenuItem icon="history" title="Order History" subtitle="View all your past feasts" href="#" />
                    <MenuItem icon="location_on" title="Saved Addresses" subtitle="Manage your delivery spots" href="#" />
                    <MenuItem icon="payments" title="Payment Methods" subtitle="Cards, UPI, and more" href="#" />
                    <MenuItem icon="favorite" title="Favorites" subtitle="Your most loved dishes" href="#" />

                    <h3 className="font-black text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest ml-4 mt-6 mb-3">Support & Legal</h3>
                    <MenuItem icon="help" title="Help Center" subtitle="FAQs and customer support" href="#" />
                    <MenuItem icon="description" title="Terms of Service" href="#" />
                    <MenuItem icon="shield" title="Privacy Policy" href="#" />

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 p-4 mt-8 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl font-black text-sm uppercase tracking-widest border border-red-100 dark:border-red-900/30"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Logout
                    </motion.button>
                </div>
            </div>

            <BottomNav />
        </main>
    );
}

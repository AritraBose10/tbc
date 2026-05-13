"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

interface User {
    id: string;
    email: string;
    name: string;
    phone: string;
    createdAt: string;
}

interface Stats {
    orderCount: number;
    totalSpent: number;
}

interface RecentOrder {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    items: { name: string; quantity: number }[];
}

function getInitials(name: string, email: string): string {
    if (name?.trim()) {
        const parts = name.trim().split(" ");
        return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
    }
    return email?.[0]?.toUpperCase() ?? "?";
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        pending:    { label: "Pending",    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
        accepted:   { label: "Accepted",   cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
        dispatched: { label: "On the Way", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
        delivered:  { label: "Delivered",  cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
        rejected:   { label: "Rejected",   cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
    };
    const s = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-600" };
    return (
        <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${s.cls}`}>
            {s.label}
        </span>
    );
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<Stats>({ orderCount: 0, totalSpent: 0 });
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit profile modal
    const [editOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => {
                if (res.status === 401) {
                    router.push("/login?next=/profile");
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (!data) return;
                setUser(data.user);
                setStats(data.stats);
                setRecentOrders(data.recentOrders ?? []);
            })
            .finally(() => setLoading(false));
    }, [router]);

    function openEdit() {
        setEditName(user?.name ?? "");
        setEditPhone(user?.phone ?? "");
        setSaveError("");
        setEditOpen(true);
    }

    async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setSaveError("");
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName, phone: editPhone }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Save failed");
            setUser((u) => u ? { ...u, ...data.user } : data.user);
            setEditOpen(false);
        } catch (err: unknown) {
            setSaveError(err instanceof Error ? err.message : "Save failed");
        } finally {
            setSaving(false);
        }
    }

    async function logout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-[#FFFDF0] dark:bg-background-dark flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
                    <p className="text-sm text-slate-400 font-semibold">Loading your profile…</p>
                </div>
            </main>
        );
    }

    if (!user) return null;

    const initials = getInitials(user.name, user.email);
    const displayName = user.name || "Foodie";
    const memberSince = new Date(user.createdAt).getFullYear();

    return (
        <main className="min-h-screen bg-[#FFFDF0] dark:bg-background-dark pb-28 mughal-pattern font-display">

            {/* ── Profile Header ── */}
            <div className="px-5 pt-10 pb-24 bg-[#0A2647] dark:bg-slate-950 relative overflow-hidden rounded-b-[40px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-terracotta/10 rounded-full blur-[80px] -ml-24 -mb-24" />

                {/* Edit button top-right */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={openEdit}
                    className="absolute top-10 right-5 z-10 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-white text-sm">edit</span>
                </motion.button>

                <div className="relative z-10 flex flex-col items-center">
                    {/* Avatar */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center bg-primary/20 mb-4"
                    >
                        <span className="text-3xl font-black text-primary">{initials}</span>
                    </motion.div>

                    <motion.h2
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl font-black text-white tracking-tight"
                    >
                        {displayName}
                    </motion.h2>
                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="text-slate-400 text-sm"
                    >
                        {user.email}
                    </motion.p>
                    {user.phone && (
                        <motion.p
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-500 text-xs mt-0.5"
                        >
                            +91 {user.phone}
                        </motion.p>
                    )}

                    {/* Stats strip */}
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="flex gap-6 mt-6"
                    >
                        <div className="text-center">
                            <p className="text-white font-black text-lg">{stats.orderCount}</p>
                            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Orders</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <p className="text-white font-black text-lg">
                                ₹{stats.totalSpent >= 1000
                                    ? `${(stats.totalSpent / 1000).toFixed(1)}k`
                                    : stats.totalSpent.toFixed(0)}
                            </p>
                            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Spent</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <p className="text-white font-black text-lg">{memberSince}</p>
                            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Member</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="px-5 -mt-10 relative z-20 space-y-5">

                {/* Recent Orders */}
                {recentOrders.length > 0 ? (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl premium-shadow ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden"
                    >
                        <div className="flex justify-between items-center px-4 pt-4 pb-3">
                            <h3 className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-widest">
                                Recent Orders
                            </h3>
                            <Link
                                href="/orders"
                                className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-0.5"
                            >
                                See all
                                <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {recentOrders.slice(0, 3).map((order) => (
                                <Link key={order.id} href={`/track/${order.id}`}>
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary text-sm">receipt_long</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                                {order.items[0]?.name ?? "Order"}
                                                {order.items.length > 1 && ` +${order.items.length - 1} more`}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium">
                                                ₹{order.totalAmount.toFixed(0)} &nbsp;·&nbsp;{" "}
                                                {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                            </p>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 premium-shadow ring-1 ring-slate-100 dark:ring-slate-800 text-center"
                    >
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 block mb-2">
                            restaurant_menu
                        </span>
                        <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">No orders yet</p>
                        <p className="text-xs text-slate-400 mb-4">Your order history will appear here after your first feast.</p>
                        <Link
                            href="/menu"
                            className="inline-flex items-center gap-1 text-xs font-black text-primary uppercase tracking-widest"
                        >
                            Browse menu <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </Link>
                    </motion.div>
                )}

                {/* Account Menu */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="space-y-1"
                >
                    <p className="font-black text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest ml-2 mb-3">
                        Account
                    </p>
                    <AccountItem icon="person" title="Edit Profile" subtitle="Name, phone number" onClick={openEdit} />
                    <AccountItem icon="history" title="Order History" subtitle="View all your past feasts" href="/orders" />
                    <AccountItem icon="location_on" title="Saved Addresses" subtitle="Manage delivery spots" href="#" comingSoon />
                    <AccountItem icon="favorite" title="Favourites" subtitle="Your most-loved dishes" href="#" comingSoon />
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-1"
                >
                    <p className="font-black text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest ml-2 mb-3">
                        Support & Legal
                    </p>
                    <AccountItem icon="help" title="Help Centre" subtitle="FAQs and customer support" href="/support" />
                    <AccountItem icon="description" title="Terms of Service" href="#" />
                    <AccountItem icon="shield" title="Privacy Policy" href="#" />
                </motion.div>

                {/* Logout */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.45 }}
                >
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-black text-sm uppercase tracking-widest border border-red-100 dark:border-red-900/30"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Sign Out
                    </motion.button>
                </motion.div>
            </div>

            {/* ── Edit Profile Modal ── */}
            <AnimatePresence>
                {editOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditOpen(false)}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 60 }}
                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-10 shadow-2xl"
                        >
                            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5" />
                            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-5">Edit Profile</h3>
                            <form onSubmit={saveProfile} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Your name"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                                        Phone Number
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-bold border border-slate-200 dark:border-slate-700">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={10}
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ""))}
                                            placeholder="10-digit mobile number"
                                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                                        Link your phone to view orders placed at this number.
                                    </p>
                                </div>

                                {saveError && (
                                    <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">error</span>
                                        {saveError}
                                    </p>
                                )}

                                <div className="flex gap-3 pt-1">
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setEditOpen(false)}
                                        className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-sm"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        disabled={saving}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex-1 py-3 rounded-2xl bg-[#0A2647] text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {saving ? (
                                            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                        ) : "Save"}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BottomNav />
        </main>
    );
}

function AccountItem({
    icon, title, subtitle, href, onClick, comingSoon,
}: {
    icon: string;
    title: string;
    subtitle?: string;
    href?: string;
    onClick?: () => void;
    comingSoon?: boolean;
}) {
    const inner = (
        <motion.div
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/80 rounded-2xl mb-2 premium-shadow border border-slate-50 dark:border-slate-800"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">{title}</h3>
                    {subtitle && <p className="text-[10px] text-slate-500 dark:text-slate-400">{subtitle}</p>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {comingSoon && (
                    <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Soon
                    </span>
                )}
                <span className="material-symbols-outlined text-slate-300 text-lg">chevron_right</span>
            </div>
        </motion.div>
    );

    if (onClick) return <button onClick={onClick} className="w-full text-left">{inner}</button>;
    if (href && href !== "#") return <Link href={href}>{inner}</Link>;
    return (
        <button
            className="w-full text-left"
            onClick={() => comingSoon && alert("Feature coming soon!")}
        >
            {inner}
        </button>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    status: string;
    orderType: string;
    totalAmount: number;
    tokenNumber: string | null;
    createdAt: string;
    items: OrderItem[];
}

const STATUS_MAP: Record<string, { label: string; cls: string; icon: string }> = {
    pending:    { label: "Pending",    icon: "schedule",       cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    accepted:   { label: "Accepted",   icon: "thumb_up",       cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    dispatched: { label: "On the Way", icon: "moped",          cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    delivered:  { label: "Delivered",  icon: "check_circle",   cls: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" },
    rejected:   { label: "Rejected",   icon: "cancel",         cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
};

const ACTIVE = new Set(["pending", "accepted", "dispatched"]);

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_MAP[status] ?? { label: status, icon: "info", cls: "bg-slate-100 text-slate-500" };
    return (
        <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${s.cls}`}>
            <span className="material-symbols-outlined text-[11px]">{s.icon}</span>
            {s.label}
        </span>
    );
}

function OrderCard({ order }: { order: Order }) {
    const [expanded, setExpanded] = useState(false);
    const isActive = ACTIVE.has(order.status);
    const date = new Date(order.createdAt);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl premium-shadow ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden"
        >
            {/* Active order accent */}
            {isActive && <div className="h-0.5 bg-gradient-to-r from-primary to-green-400" />}

            <button
                className="w-full text-left p-4"
                onClick={() => setExpanded((v) => !v)}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                            <StatusBadge status={order.status} />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {order.orderType === "P" ? "Takeaway" : "Delivery"}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                            {order.id}
                            {order.tokenNumber && (
                                <span className="ml-2 text-primary">· Token #{order.tokenNumber}</span>
                            )}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                            {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            {" · "}
                            {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-base font-black text-slate-800 dark:text-white">
                            ₹{order.totalAmount.toFixed(0)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                {/* Preview of first item */}
                {!expanded && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
                        {order.items[0]?.name}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                    </p>
                )}
            </button>

            {/* Expanded items list */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-2 space-y-1.5 border-t border-slate-50 dark:border-slate-800 pt-3">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <span className="text-xs text-slate-600 dark:text-slate-300">
                                        <span className="font-black text-slate-400 mr-1.5">{item.quantity}×</span>
                                        {item.name}
                                    </span>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                        ₹{(item.price * item.quantity).toFixed(0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer actions */}
            <div className="px-4 pb-4 pt-1 flex gap-2">
                {isActive && (
                    <Link
                        href={`/track/${order.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#0A2647] text-white rounded-xl text-[11px] font-black uppercase tracking-widest"
                    >
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        Track Order
                    </Link>
                )}
                <button
                    onClick={() => setExpanded((v) => !v)}
                    className="flex items-center justify-center gap-1 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[11px] font-bold"
                >
                    <span className="material-symbols-outlined text-sm">
                        {expanded ? "expand_less" : "expand_more"}
                    </span>
                    {expanded ? "Less" : "Details"}
                </button>
            </div>
        </motion.div>
    );
}

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/orders")
            .then((res) => {
                if (res.status === 401) { router.push("/login?next=/orders"); return null; }
                return res.json();
            })
            .then((data) => { if (data) setOrders(data.orders ?? []); })
            .finally(() => setLoading(false));
    }, [router]);

    const active = orders.filter((o) => ACTIVE.has(o.status));
    const past   = orders.filter((o) => !ACTIVE.has(o.status));

    return (
        <main className="min-h-screen bg-[#FFFDF0] dark:bg-background-dark pb-28 font-display">
            {/* Header */}
            <div className="sticky top-0 z-40 flex items-center gap-3 px-5 pt-10 pb-4 bg-[#FFFDF0]/90 dark:bg-background-dark/90 backdrop-blur-sm">
                <Link href="/profile">
                    <motion.div whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-lg">arrow_back</span>
                    </motion.div>
                </Link>
                <div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Order History</h1>
                    {!loading && (
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                            {orders.length} order{orders.length !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>
            </div>

            <div className="px-5 space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
                        <p className="text-sm text-slate-400 font-semibold">Loading your orders…</p>
                    </div>
                ) : orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4">receipt_long</span>
                        <p className="text-lg font-black text-slate-700 dark:text-white mb-2">No orders yet</p>
                        <p className="text-sm text-slate-400 mb-6 max-w-xs">
                            Your order history will appear here. Time to place your first feast!
                        </p>
                        <Link
                            href="/menu"
                            className="flex items-center gap-2 px-5 py-3 bg-[#0A2647] text-white rounded-2xl font-black text-sm uppercase tracking-widest"
                        >
                            <span className="material-symbols-outlined text-sm">restaurant_menu</span>
                            Browse Menu
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        {active.length > 0 && (
                            <section>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Active</p>
                                <div className="space-y-3">
                                    {active.map((o) => <OrderCard key={o.id} order={o} />)}
                                </div>
                            </section>
                        )}
                        {past.length > 0 && (
                            <section>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Past Orders</p>
                                <div className="space-y-3">
                                    {past.map((o) => <OrderCard key={o.id} order={o} />)}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            <BottomNav />
        </main>
    );
}

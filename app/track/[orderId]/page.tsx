"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

interface OrderAddon { name: string; price: number }
interface OrderItem  { name: string; quantity: number; price: number; addons: OrderAddon[] }
interface Callback   { status: string; prepTime: number | null; receivedAt: string }

interface OrderData {
    id:           string;
    status:       string;
    orderType:    string;
    tokenNumber:  string | null;
    customerName: string;
    totalAmount:  number;
    createdAt:    string;
    items:        OrderItem[];
    callbacks:    Callback[];
    paymentStatus: string;
    paymentType:   string;
}

const STATUS_STEP: Record<string, number> = {
    pending:    1,
    accepted:   2,
    preparing:  2,
    ready:      3,
    food_ready: 3,
    dispatched: 3,
    delivered:  4,
};

export default function TrackOrder() {
    const params  = useParams();
    const orderId = params.orderId as string;

    const [order,      setOrder]      = useState<OrderData | null>(null);
    const [notFound,   setNotFound]   = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(0);

    const fetchStatus = useCallback(async () => {
        try {
            const res  = await fetch(`/api/order-status/${orderId}`, { cache: "no-store" });
            const data = await res.json();
            if (!data.success) { setNotFound(true); return; }
            setOrder(data);
        } catch {
            // silently retry on next interval
        }
    }, [orderId]);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 15000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    useEffect(() => {
        if (!order?.createdAt) return;
        const WINDOW = 2 * 60 * 1000;
        const tick = () => {
            const age = Date.now() - new Date(order.createdAt).getTime();
            setSecondsLeft(Math.max(0, Math.floor((WINDOW - age) / 1000)));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [order?.createdAt]);

    const isCancelled = order?.status === "cancelled" || order?.status === "rejected";
    const isFinal     = isCancelled || order?.status === "delivered";
    const isTakeaway  = order?.orderType === "P";
    const currentStep = isCancelled ? 0 : (order ? (STATUS_STEP[order.status] ?? 1) : 1);
    const prepTime    = order?.callbacks.findLast((c) => c.prepTime != null)?.prepTime ?? null;
    const canCancel   = !!order && !isFinal && secondsLeft > 0 && order.status === 'pending';

    const handleCancel = async () => {
        setCancelling(true);
        try {
            const res  = await fetch(`/api/order/${orderId}/cancel`, { method: 'POST' });
            const data = await res.json();
            if (data.success) { fetchStatus(); }
            else { alert(data.error ?? 'Could not cancel order. Please call us directly.'); }
        } finally {
            setCancelling(false);
        }
    };

    const steps = [
        { id: 1, title: "Order Placed",                              subtitle: "We have received your order",                             icon: "receipt_long" },
        { id: 2, title: "Accepted",                                  subtitle: prepTime ? `Preparing your food · Est. ${prepTime} min` : "Waiting for The Biryani Canteen", icon: "skillet" },
        { id: 3, title: isTakeaway ? "Ready for Pickup" : "On the Way", subtitle: isTakeaway ? "Your order is ready at the counter" : "Your order is on its way", icon: isTakeaway ? "storefront" : "two_wheeler" },
        { id: 4, title: isTakeaway ? "Picked Up" : "Delivered",     subtitle: "Enjoy your meal!",                                        icon: "home" },
    ];

    return (
        <main className="bg-[#f0f3f5] dark:bg-gray-900 min-h-screen pb-10 font-sans">
            {/* Header / Map Area */}
            <div className="relative h-80 w-full overflow-hidden bg-zinc-800">
                <div
                    className="absolute inset-0 opacity-40"
                    style={{
                        backgroundImage: "url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h100v100H0z%22 fill=%22%2327272a%22/%3E%3Cpath d=%22M10 10h80v80H10z%22 fill=%22none%22 stroke=%22%233f3f46%22 stroke-width=%221%22/%3E%3Cpath d=%22M30 30h40v40H30z%22 fill=%22none%22 stroke=%22%2352525b%22 stroke-width=%221%22 stroke-dasharray=%224 4%22/%3E%3C/svg%3E')",
                        backgroundSize: "100px 100px",
                    }}
                />

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-4 left-4 z-20">
                    <Link href="/">
                        <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg text-gray-800 dark:text-white transition-transform active:scale-95">
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </div>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                >
                    <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-gray-100 dark:border-gray-700">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isCancelled ? "bg-red-500" : "bg-green-500"}`} />
                        <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
                            {notFound ? "Order not found"
                                : !order   ? "Loading…"
                                : isCancelled ? "Order Cancelled"
                                : currentStep === 1 ? "Waiting for Confirmation"
                                : currentStep === 3 ? (isTakeaway ? "Ready for Pickup" : "On the Way")
                                : currentStep === 4 ? (isTakeaway ? "Picked Up" : "Delivered")
                                : prepTime ? `Ready in ~${prepTime} min`
                                : "Preparing Order"}
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Sheet */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative -mt-6 bg-white dark:bg-gray-900 rounded-t-[32px] px-6 pt-8 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] min-h-[50vh]"
            >
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />

                <div className="mb-8">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Order Status</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium font-mono">{orderId}</p>
                </div>

                {/* Cancelled banner & Refund Tracker */}
                {isCancelled && (
                    <div className="space-y-4 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">cancel</span>
                            </div>
                            <div>
                                <p className="font-bold text-red-700 dark:text-red-400">Order Cancelled</p>
                                <p className="text-sm text-red-500 mt-0.5">This order was rejected or cancelled.</p>
                            </div>
                        </motion.div>

                        {/* Refund Tracking Visual Panel */}
                        {order && order.paymentType === "ONLINE" && !["pending", "payment_failed"].includes(order.paymentStatus) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className={`p-5 rounded-2xl border flex flex-col gap-3 ${
                                    order.paymentStatus === "refunded"
                                        ? "bg-green-50/70 border-green-200 dark:bg-green-950/20 dark:border-green-850"
                                        : order.paymentStatus === "refund_initiated"
                                        ? "bg-amber-50/70 border-amber-200 dark:bg-amber-950/20 dark:border-amber-850"
                                        : "bg-blue-50/70 border-blue-200 dark:bg-blue-950/20 dark:border-blue-850"
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                        order.paymentStatus === "refunded"
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            : order.paymentStatus === "refund_initiated"
                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    }`}>
                                        <span className="material-symbols-outlined text-xl">
                                            {order.paymentStatus === "refunded" ? "currency_rupee"
                                                : order.paymentStatus === "refund_initiated" ? "sync"
                                                : "info"}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-bold text-[15px] ${
                                            order.paymentStatus === "refunded" ? "text-green-800 dark:text-green-400"
                                                : order.paymentStatus === "refund_initiated" ? "text-amber-800 dark:text-amber-400"
                                                : "text-blue-800 dark:text-blue-400"
                                        }`}>
                                            {order.paymentStatus === "refunded" ? "Refund Processed"
                                                : order.paymentStatus === "refund_initiated" ? "Refund Initiated"
                                                : "Refund Under Review"}
                                        </h4>
                                        <p className={`text-xs mt-1 leading-relaxed ${
                                            order.paymentStatus === "refunded" ? "text-green-600 dark:text-green-400/80"
                                                : order.paymentStatus === "refund_initiated" ? "text-amber-600 dark:text-amber-400/80"
                                                : "text-blue-600 dark:text-blue-400/80"
                                        }`}>
                                            {order.paymentStatus === "refunded"
                                                ? "A full refund of the order amount has been successfully processed and credited back to your account."
                                                : order.paymentStatus === "refund_initiated"
                                                ? "The refund request was successfully sent to your bank. Depending on your bank, it should reflect in your account shortly."
                                                : "Your online payment is being reviewed by the canteen team to initiate your refund."}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Takeaway token */}
                {isTakeaway && order?.tokenNumber && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-xl flex items-center justify-center p-6"
                        style={{ border: "4px dashed rgb(153 27 27)" }}
                    >
                        <div className="text-center">
                            <p className="text-red-200 font-bold uppercase tracking-widest text-xs mb-1">Takeaway Token</p>
                            <h2 className="text-6xl font-black tracking-tighter" style={{ fontFamily: "monospace" }}>
                                {order.tokenNumber}
                            </h2>
                            <p className="text-red-100 text-xs mt-2 opacity-80">Show this number at the counter</p>
                        </div>
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-900 rounded-full" />
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-900 rounded-full" />
                    </motion.div>
                )}

                {/* Timeline */}
                <div className="relative pl-4 mb-10">
                    <div className="absolute left-[27px] top-4 bottom-8 w-0.5 bg-gray-100 dark:bg-gray-800" />
                    <div className="space-y-8 relative">
                        {steps.map((step) => {
                            const isActive = currentStep === step.id && currentStep < 4;
                            const isPast   = currentStep > step.id || (currentStep === 4 && step.id === 4);
                            return (
                                <div key={step.id} className="flex gap-5 relative z-10">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[3px] bg-white dark:bg-gray-900 ${
                                            isActive ? "border-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.1)]"
                                            : isPast  ? "border-green-500 bg-green-500"
                                            :           "border-gray-200 dark:border-gray-700"
                                        }`}>
                                            {isPast   && <span className="material-symbols-outlined text-[12px] text-white font-bold">check</span>}
                                            {isActive && <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}
                                        </div>
                                    </div>
                                    <div className={`-mt-1 ${!isPast && !isActive ? "opacity-40" : ""}`}>
                                        <h4 className={`font-bold text-[15px] ${isActive ? "text-orange-600 dark:text-orange-400" : "text-gray-900 dark:text-white"}`}>
                                            {step.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{step.subtitle}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {!isFinal && (
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mb-8">
                        Auto-refreshes every 15 seconds
                    </p>
                )}

                {/* Order summary */}
                {order && (
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Bill Details</h3>
                        <div className="space-y-3 mb-4">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-start text-sm">
                                    <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {item.name} <span className="text-gray-400">x{item.quantity}</span>
                                        </span>
                                        {item.addons.length > 0 && (
                                            <span className="text-[11px] text-gray-400">
                                                {item.addons.map((a) => a.name).join(", ")}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white shrink-0 ml-2">
                                        ₹{(item.price * item.quantity).toFixed(0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                            <span className="font-bold text-gray-900 dark:text-white">Total</span>
                            <span className="font-black text-lg text-gray-900 dark:text-white">₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                {canCancel && (
                    <motion.button
                        onClick={handleCancel}
                        disabled={cancelling}
                        whileTap={{ scale: 0.97 }}
                        className="mt-6 mb-2 w-full flex items-center justify-center gap-2 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black rounded-2xl text-sm uppercase tracking-widest border border-red-200 dark:border-red-800 disabled:opacity-60"
                    >
                        <span className="material-symbols-outlined text-base">cancel</span>
                        {cancelling
                            ? 'Cancelling…'
                            : `Cancel Order · ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`}
                    </motion.button>
                )}

                <Link
                    href="/menu"
                    className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-royal-blue text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-royal-blue/20"
                >
                    <span className="material-symbols-outlined text-base">restaurant_menu</span>
                    Order Again
                </Link>
            </motion.div>
        </main>
    );
}

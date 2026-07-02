"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useCartAvailability } from "@/hooks/useCartAvailability";
import { PREDESTINED_LOCATIONS } from "@/constants/locations";

export default function Checkout() {
    const router = useRouter();
    const { items, getSubtotal, getTax, getTotal, clearCart } = useCartStore();
    const { outOfStockIds } = useCartAvailability();

    const [authed, setAuthed]   = useState<boolean | null>(null);
    const [swiped, setSwiped]   = useState(false);
    const [placing, setPlacing] = useState(false);
    const [error, setError]     = useState("");

    // Customer info
    const [customerName, setCustomerName]   = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    // Delivery location
    const [selectedBuilding, setSelectedBuilding] = useState("");
    const [selectedFloor, setSelectedFloor]       = useState("");
    const [selectedRoom, setSelectedRoom]         = useState("");

    // Order Type (H = Delivery, P = Takeaway) — delivery disabled until live
    const [orderType, setOrderType] = useState<"H" | "P">("P");

    // Preparation preference — passed to Petpooja as order description
    const [prepType, setPrepType] = useState<"Parcel" | "Dine In">("Parcel");

    // Payment method state
    const [paymentMethod, setPaymentMethod] = useState<"ONLINE">("ONLINE");

    // Load Razorpay script dynamically with local fallback
    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => {
                console.warn("External Razorpay script failed to load. Falling back to local script.");
                const fallbackScript = document.createElement("script");
                fallbackScript.src = "/checkout.js";
                fallbackScript.async = true;
                fallbackScript.onload = () => resolve(true);
                fallbackScript.onerror = () => resolve(false);
                document.body.appendChild(fallbackScript);
            };
            document.body.appendChild(script);
        });
    };

    // Require login — redirect to /login if not authenticated
    useEffect(() => {
        fetch("/api/auth/me")
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (!data?.user) {
                    router.replace("/login?next=/checkout");
                    return;
                }
                setAuthed(true);
                if (!customerName && data.user.name)  setCustomerName(data.user.name);
                if (!customerPhone && data.user.phone) setCustomerPhone(data.user.phone);
            })
            .catch(() => router.replace("/login?next=/checkout"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const subtotal      = getSubtotal();
    const taxes         = getTax();
    const total         = getTotal();
    const PARCEL_CHARGE = 10;
    const parcelCharge  = prepType === "Parcel" ? PARCEL_CHARGE : 0;
    const grandTotal    = total + parcelCharge;

    const dragX  = useMotionValue(0);
    const dragBg = useTransform(dragX, [0, 250], ["rgba(178,34,34,1)", "rgba(34,139,34,1)"]);
    const dragOpacity = useTransform(dragX, [0, 200], [1, 0.3]);

    const handleDragEnd = async () => {
        const x = dragX.get();
        if (x <= 200) {
            animate(dragX, 0, { type: "spring", stiffness: 300 });
            return;
        }

        // ── Validation ─────────────────────────────────────────────────────
        if (!customerName.trim() || !customerPhone.trim()) {
            setError("Please enter your name and phone number.");
            animate(dragX, 0, { type: "spring", stiffness: 300 });
            return;
        }
        if (!/^\d{10}$/.test(customerPhone.trim())) {
            setError("Please enter a valid 10-digit mobile number.");
            animate(dragX, 0, { type: "spring", stiffness: 300 });
            return;
        }
        if (orderType === "H" && (!selectedBuilding || !selectedFloor || !selectedRoom)) {
            setError("Please select your building, floor, and room.");
            animate(dragX, 0, { type: "spring", stiffness: 300 });
            return;
        }

        if (outOfStockIds.size > 0) {
            setError("Some items in your cart are out of stock. Go back and remove them.");
            animate(dragX, 0, { type: "spring", stiffness: 300 });
            return;
        }

        setError("");
        setPlacing(true);
        animate(dragX, 290, { type: "spring", stiffness: 300 });

        try {
            const building = PREDESTINED_LOCATIONS.find((b) => b.id === selectedBuilding);
            const floor    = building?.floors.find((f) => f.id === selectedFloor);
            const address = orderType === "P" 
                ? "Takeaway / Self Pickup" 
                : `Room ${selectedRoom}, ${floor?.name ?? selectedFloor}, ${building?.name ?? selectedBuilding}`;

            // ONLINE PAYMENT FLOW
            // 1. Load Razorpay Script
                const scriptLoaded = await loadRazorpayScript();
                if (!scriptLoaded) {
                    throw new Error("Unable to load Razorpay payment gateway script. Please check your internet connection.");
                }

                // 2. Create Razorpay order on the server
                const rzpRes = await fetch("/api/payments/razorpay/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        items: items.map((item) => ({
                            petpoojaId: item.id,
                            name:       item.name,
                            price:      item.price,
                            quantity:   item.quantity,
                            addons:     (item.addons ?? []).map((a) => ({
                                petpoojaId: a.petpoojaId,
                                name:       a.name,
                                price:      a.price,
                            })),
                        })),
                        packingCharges: parcelCharge,
                    }),
                });

                const rzpData = await rzpRes.json();
                if (!rzpData.success) {
                    throw new Error(rzpData.error ?? "Failed to initialize payment gateway order.");
                }

                // 3. Configure and Open Razorpay Checkout overlay
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: rzpData.amount,
                    currency: rzpData.currency,
                    name: "The Biryani Canteen",
                    description: "Food Order",
                    image: "/image.png",
                    order_id: rzpData.razorpayOrderId,
                    prefill: {
                        name: customerName.trim(),
                        contact: customerPhone.trim(),
                    },
                    config: {
                        display: {
                            blocks: {
                                upi: {
                                    name: "Pay via UPI",
                                    instruments: [
                                        { method: "upi" },
                                    ],
                                },
                                other: {
                                    name: "Other Payment Methods",
                                    instruments: [
                                        { method: "card" },
                                        { method: "netbanking" },
                                        { method: "wallet" },
                                    ],
                                },
                            },
                            sequence: ["block.upi", "block.other"],
                            preferences: { show_default_blocks: false },
                        },
                    },
                    theme: {
                        color: "#d4af35",
                    },
                    handler: async function (response: any) {
                        try {
                            setPlacing(true);
                            const res = await fetch("/api/order", {
                                method:  "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    customer: {
                                        name:    customerName.trim(),
                                        address,
                                        mobile:  customerPhone.trim(),
                                        email:   "",
                                        latitude:  "",
                                        longitude: "",
                                    },
                                    items: items.map((item) => ({
                                        petpoojaId: item.id,
                                        name:       item.name,
                                        price:      item.price,
                                        quantity:   item.quantity,
                                        addons:     (item.addons ?? []).map((a) => ({
                                            petpoojaId: a.petpoojaId,
                                            name:       a.name,
                                            price:      a.price,
                                        })),
                                    })),
                                    paymentType:     "ONLINE",
                                    orderType:       orderType,
                                    description:     prepType,
                                    packingCharges:  parcelCharge,
                                    razorpayPaymentId: response.razorpay_payment_id,
                                    razorpayOrderId: response.razorpay_order_id,
                                    razorpaySignature: response.razorpay_signature,
                                }),
                            });

                            const data = await res.json();

                            if (!data.success) {
                                throw new Error(data.error ?? "Order placement failed after payment");
                            }

                            setSwiped(true);
                            clearCart();
                            setTimeout(() => {
                                router.push(`/track/${data.orderId}`);
                            }, 1500);
                        } catch (err) {
                            setError(err instanceof Error ? err.message : "Payment verification failed. Please contact support.");
                            setPlacing(false);
                            animate(dragX, 0, { type: "spring", stiffness: 300 });
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            setError("Payment cancelled. You can retry paying.");
                            setPlacing(false);
                            animate(dragX, 0, { type: "spring", stiffness: 300 });
                        },
                    },
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Order placement failed. Please try again.");
            setPlacing(false);
            animate(dragX, 0, { type: "spring", stiffness: 300 });
        }
    };

    if (!authed) return null;

    return (
        <main className="bg-[#FFFDF0] dark:bg-background-dark min-h-screen pb-44">
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-0 z-40 flex items-center justify-between p-4 bg-[#FFFDF0] dark:bg-background-dark border-b border-slate-100 dark:border-slate-800"
            >
                <Link href="/cart">
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-royal-blue dark:text-primary"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </motion.div>
                </Link>
                <h1 className="text-xl font-extrabold text-royal-blue dark:text-white">Checkout</h1>
                <div className="w-10" />
            </motion.div>

            <div className="p-5 space-y-5 mt-2">

                {/* Order Type Toggle */}
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex gap-1 relative shadow-inner">
                    {/* Delivery — disabled until service is live */}
                    <button
                        disabled
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm z-10 opacity-40 cursor-not-allowed text-slate-500 dark:text-slate-400"
                    >
                        <span className="material-symbols-outlined text-[20px]">moped</span>
                        Delivery
                        <span className="text-[9px] font-black uppercase tracking-widest bg-orange-400 text-white rounded-full px-1.5 py-0.5 leading-none">Soon</span>
                    </button>
                    <button
                        onClick={() => setOrderType("P")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm z-10 transition-colors ${orderType === "P" ? "text-slate-800 dark:text-slate-900" : "text-slate-500 dark:text-slate-400"}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                        Takeaway
                    </button>
                    {/* Active Background */}
                    <motion.div
                        layout
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute top-1 bottom-1 w-[calc(50%-6px)] bg-white dark:bg-primary rounded-xl shadow-sm z-0"
                        style={{ left: orderType === "H" ? "4px" : "calc(50% + 2px)" }}
                    />
                </div>

                {/* Preparation Preference */}
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex gap-1 relative shadow-inner">
                    {(["Parcel", "Dine In"] as const).map((option) => (
                        <button
                            key={option}
                            onClick={() => setPrepType(option)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm z-10 transition-colors ${prepType === option ? "text-slate-800 dark:text-slate-900" : "text-slate-500 dark:text-slate-400"}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                {option === "Parcel" ? "takeout_dining" : "restaurant"}
                            </span>
                            {option}
                        </button>
                    ))}
                    <motion.div
                        layout
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute top-1 bottom-1 w-[calc(50%-6px)] bg-white dark:bg-primary rounded-xl shadow-sm z-0"
                        style={{ left: prepType === "Parcel" ? "4px" : "calc(50% + 2px)" }}
                    />
                </div>

                {/* Customer Info */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-royal-blue dark:text-primary text-xl">person</span>
                        <h2 className="font-bold text-slate-800 dark:text-slate-200">Your Details</h2>
                    </div>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Full name"
                            value={customerName}
                            onChange={(e) => { setCustomerName(e.target.value); setError(""); }}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                        />
                        <input
                            type="tel"
                            placeholder="Phone number"
                            value={customerPhone}
                            onChange={(e) => { setCustomerPhone(e.target.value); setError(""); }}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </motion.section>

                {/* Delivery Location */}
                {orderType === "H" && (
                    <motion.section
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-royal-blue dark:text-primary text-xl">location_on</span>
                            <h2 className="font-bold text-slate-800 dark:text-slate-200">Delivery Location</h2>
                        </div>

                        <div className="space-y-3">
                            {/* Building */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Building</label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors cursor-pointer"
                                        value={selectedBuilding}
                                        onChange={(e) => {
                                            setSelectedBuilding(e.target.value);
                                            setSelectedFloor("");
                                            setSelectedRoom("");
                                            setError("");
                                        }}
                                    >
                                        <option value="" disabled>Select Building</option>
                                        {PREDESTINED_LOCATIONS.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
                                </div>
                            </div>

                            {/* Floor */}
                            <div className={selectedBuilding ? "opacity-100" : "opacity-40 pointer-events-none"}>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Floor</label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors cursor-pointer disabled:cursor-not-allowed"
                                        value={selectedFloor}
                                        onChange={(e) => { setSelectedFloor(e.target.value); setSelectedRoom(""); }}
                                        disabled={!selectedBuilding}
                                    >
                                        <option value="" disabled>Select Floor</option>
                                        {selectedBuilding &&
                                            PREDESTINED_LOCATIONS.find((b) => b.id === selectedBuilding)?.floors.map((f) => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
                                </div>
                            </div>

                            {/* Room */}
                            <div className={selectedFloor ? "opacity-100" : "opacity-40 pointer-events-none"}>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Room</label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors cursor-pointer disabled:cursor-not-allowed"
                                        value={selectedRoom}
                                        onChange={(e) => setSelectedRoom(e.target.value)}
                                        disabled={!selectedFloor}
                                    >
                                        <option value="" disabled>Select Room</option>
                                        {selectedFloor &&
                                            PREDESTINED_LOCATIONS.find((b) => b.id === selectedBuilding)
                                                ?.floors.find((f) => f.id === selectedFloor)
                                                ?.rooms.map((r) => (
                                                    <option key={r} value={r}>Room {r}</option>
                                                ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
                                </div>
                            </div>

                            {selectedBuilding && selectedFloor && selectedRoom && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 mt-1"
                                >
                                    <span className="material-symbols-outlined text-green-600 text-base">check_circle</span>
                                    <span className="text-xs font-bold text-green-700 dark:text-green-400">
                                        Delivering to Room {selectedRoom},{" "}
                                        {PREDESTINED_LOCATIONS.find((b) => b.id === selectedBuilding)?.floors.find((f) => f.id === selectedFloor)?.name},{" "}
                                        {PREDESTINED_LOCATIONS.find((b) => b.id === selectedBuilding)?.name}
                                    </span>
                                </motion.div>
                            )}
                        </div>
                    </motion.section>
                )}

                {/* Order Summary */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-royal-blue dark:text-primary text-xl">receipt_long</span>
                        <h2 className="font-bold text-slate-800 dark:text-slate-200">Order Summary</h2>
                    </div>

                    <div className="space-y-3 mb-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black rounded-lg px-2 py-0.5 min-w-[28px] text-center">
                                        {item.quantity}x
                                    </span>
                                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-tight">
                                        {item.name}
                                    </p>
                                </div>
                                <p className="font-bold text-sm text-slate-800 dark:text-slate-200 shrink-0 ml-2">
                                    &#8377;{((item.price + (item.addons ?? []).reduce((s, a) => s + a.price, 0)) * item.quantity).toFixed(0)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-sm">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>Subtotal</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">&#8377;{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>Delivery</span>
                            <span className="text-green-600 font-bold">FREE</span>
                        </div>
                        {parcelCharge > 0 && (
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                <span>Parcel charge</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">&#8377;{parcelCharge.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-slate-800 dark:text-white">Total</span>
                            <span className="font-extrabold text-lg text-terracotta" style={{ fontFamily: "system-ui, sans-serif" }}>
                                &#8377;{grandTotal.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </motion.section>

                {/* Payment Method Selector */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-royal-blue dark:text-primary text-xl">payments</span>
                        <h2 className="font-bold text-slate-800 dark:text-slate-200">Payment Method</h2>
                    </div>

                    <div className="space-y-3">
                        {/* Pay Online */}
                        <div
                            onClick={() => { setPaymentMethod("ONLINE"); setError(""); }}
                            className={`flex items-start gap-3.5 rounded-2xl p-4 border transition-all duration-300 cursor-pointer ${
                                paymentMethod === "ONLINE"
                                    ? "bg-primary/5 dark:bg-primary/10 border-primary shadow-[0_0_12px_rgba(244,112,20,0.12)]"
                                    : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                            }`}
                        >
                            <span className={`material-symbols-outlined text-2xl mt-0.5 transition-colors ${paymentMethod === "ONLINE" ? "text-primary" : "text-slate-400 dark:text-slate-500"}`}>
                                credit_card
                            </span>
                            <div className="flex-1">
                                <p className={`font-bold text-sm leading-snug transition-colors ${paymentMethod === "ONLINE" ? "text-slate-800 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                                    Pay Online (UPI, Cards, Netbanking)
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Secure online payment powered by Razorpay
                                </p>
                            </div>
                            <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                paymentMethod === "ONLINE"
                                    ? "border-primary"
                                    : "border-slate-300 dark:border-slate-600"
                            }`}>
                                {paymentMethod === "ONLINE" && (
                                    <motion.div
                                        layoutId="activePaymentIndicator"
                                        className="w-3 h-3 bg-primary rounded-full"
                                    />
                                )}
                            </div>
                        </div>

                    </div>
                </motion.section>

                {/* Error message */}
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3"
                    >
                        {error}
                    </motion.p>
                )}
            </div>

            {/* Swipe to Pay */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
                className="fixed bottom-0 left-0 right-0 p-5 bg-white dark:bg-background-dark z-50 border-t border-slate-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]"
            >
                <div className="flex justify-between items-center mb-4 px-1">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Amount to Pay</span>
                    <span className="text-2xl font-extrabold text-royal-blue dark:text-white" style={{ fontFamily: "system-ui, sans-serif" }}>
                        &#8377;{grandTotal.toFixed(2)}
                    </span>
                </div>

                <motion.div
                    style={{ backgroundColor: dragBg }}
                    className="relative w-full h-16 rounded-full flex items-center justify-center overflow-hidden"
                >
                    {/* Draggable thumb — hidden while placing or after swipe */}
                    {!swiped && !placing && (
                        <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 290 }}
                            dragElastic={0.05}
                            style={{ x: dragX }}
                            onDragEnd={handleDragEnd}
                            whileTap={{ scale: 0.95 }}
                            className="absolute left-1.5 top-1.5 bottom-1.5 w-13 bg-white rounded-full flex items-center justify-center z-10 cursor-grab active:cursor-grabbing shadow-lg"
                        >
                            <span className="material-symbols-outlined text-terracotta">double_arrow</span>
                        </motion.div>
                    )}

                    {/* States */}
                    {swiped ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-white">check_circle</span>
                            <span className="text-white font-black uppercase tracking-widest text-sm">Order Placed!</span>
                        </motion.div>
                    ) : placing ? (
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            <span className="text-white font-black uppercase tracking-widest text-sm">Placing Order…</span>
                        </div>
                    ) : (
                        <motion.span
                            style={{ opacity: dragOpacity }}
                            className="text-white font-black uppercase tracking-widest text-sm z-0 pl-12"
                        >
                            Swipe to Confirm
                        </motion.span>
                    )}
                </motion.div>
            </motion.div>
        </main>
    );
}

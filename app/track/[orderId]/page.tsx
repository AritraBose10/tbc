"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function TrackOrder() {
    const params = useParams();
    const orderId = params.orderId as string;

    const [currentStep, setCurrentStep] = useState(1);
    const [deliveryTime, setDeliveryTime] = useState<string | null>(null);
    const [orderDetails, setOrderDetails] = useState<any>(null);
    useEffect(() => {
        if (!orderId) return;

        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/order/${orderId}/status`);
                if (!res.ok) return;
                const data = await res.json();
                
                if (data.orderDetails) {
                    setOrderDetails(data.orderDetails);
                }

                if (data.status === 'pending') {
                    setCurrentStep(1);
                } else if (data.status === 'accepted') {
                    setCurrentStep(2);
                    if (data.deliveryTime) {
                        setDeliveryTime(`${data.deliveryTime} Mins`);
                    }
                } else if (data.status === 'food_ready') {
                    // For Takeaway, Food Ready means it's ready for pickup (Step 3)
                    // For Delivery, Food Ready means waiting for rider (still Step 2)
                    if (data.orderDetails?.orderType === 'P') {
                        setCurrentStep(3);
                    } else {
                        setCurrentStep(2);
                    }
                } else if (data.status === 'dispatched') {
                    setCurrentStep(3);
                } else if (data.status === 'delivered') {
                    setCurrentStep(4);
                }
            } catch (error) {
                console.error("Error fetching order status:", error);
            }
        };

        // Initial check
        checkStatus();

        // Poll every 5 seconds
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [orderId]);

    const isTakeaway = orderDetails?.orderType === 'P';

    const steps = [
        { id: 1, title: "Order Placed", subtitle: "We have received your order", icon: "receipt_long" },
        { id: 2, title: "Order Accepted", subtitle: deliveryTime ? `Preparing your food. Est: ${deliveryTime}` : "Waiting for The Biryani Canteen", icon: "skillet" },
        { id: 3, title: isTakeaway ? "Ready for Pickup" : "On the Way", subtitle: isTakeaway ? "Your order is ready at the counter" : "Your order has been dispatched", icon: isTakeaway ? "storefront" : "two_wheeler" },
        { id: 4, title: isTakeaway ? "Picked Up" : "Delivered", subtitle: "Enjoy your meal!", icon: "home" },
    ];

    return (
        <main className="bg-[#f0f3f5] dark:bg-gray-900 min-h-screen pb-10 font-sans">
            {/* Header / Map Area */}
            <div className="relative h-80 w-full overflow-hidden bg-zinc-800">
                {/* Map Pattern Overlay */}
                <div 
                    className="absolute inset-0 opacity-40"
                    style={{
                        backgroundImage: "url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h100v100H0z%22 fill=%22%2327272a%22/%3E%3Cpath d=%22M10 10h80v80H10z%22 fill=%22none%22 stroke=%22%233f3f46%22 stroke-width=%221%22/%3E%3Cpath d=%22M30 30h40v40H30z%22 fill=%22none%22 stroke=%22%2352525b%22 stroke-width=%221%22 stroke-dasharray=%224 4%22/%3E%3C/svg%3E')",
                        backgroundSize: "100px 100px"
                    }}
                />

                {/* Back Button */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-4 left-4 z-20">
                    <Link href="/">
                        <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg text-gray-800 dark:text-white transition-transform active:scale-95">
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </div>
                    </Link>
                </motion.div>

                {/* Dynamic ETA Pill on Map */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                >
                    <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-gray-100 dark:border-gray-700">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
                            {currentStep === 1 ? "Waiting for Confirmation" : currentStep === 4 ? "Delivered" : deliveryTime ? `Arriving in ${deliveryTime}` : "Preparing Order"}
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Sheet Card */}
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative -mt-6 bg-white dark:bg-gray-900 rounded-t-[32px] px-6 pt-8 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] min-h-[50vh]"
            >
                {/* Drag Handle */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />

                <div className="mb-8">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Order Status</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Order ID: <span className="uppercase">{orderId.split('-')[1] || orderId}</span></p>
                </div>

                {/* Delivery Partner OR Token Ticket */}
                {currentStep >= 3 && !isTakeaway && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-8 p-4 bg-orange-50 dark:bg-gray-800 rounded-2xl flex items-center justify-between border border-orange-100 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-200 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">person</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Delivery Partner</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Assigned by Petpooja</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-700 dark:text-gray-300">
                                <span className="material-symbols-outlined text-[20px]">call</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {isTakeaway && orderDetails?.tokenNumber && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-xl flex items-center justify-center p-6 border-4 border-red-800"
                        style={{ borderStyle: "dashed" }}
                    >
                        {/* Token Number Graphic */}
                        <div className="text-center">
                            <p className="text-red-200 font-bold uppercase tracking-widest text-xs mb-1">Takeaway Token</p>
                            <h2 className="text-6xl font-black tracking-tighter" style={{ fontFamily: "monospace" }}>
                                {orderDetails.tokenNumber}
                            </h2>
                            <p className="text-red-100 text-xs mt-2 opacity-80">Show this number at the counter</p>
                        </div>
                        
                        {/* Ticket cutouts */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-900 rounded-full" />
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-900 rounded-full" />
                    </motion.div>
                )}

                {/* Manual Picked Up Action for Users */}
                {currentStep === 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <button
                            disabled
                            className="w-full py-4 rounded-xl font-black text-white text-lg tracking-tight flex items-center justify-center gap-2 shadow-lg bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-70"
                        >
                            <span className="material-symbols-outlined">delivery_truck_speed</span>
                            {isTakeaway ? "I have Picked Up my Order" : "I have Received my Order"}
                        </button>
                        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">
                            🚚 Delivery Services Coming Soon
                        </p>
                    </motion.div>
                )}

                {/* Vertical Timeline */}
                <div className="relative pl-4 mb-10">
                    {/* Continuous vertical line */}
                    <div className="absolute left-[27px] top-4 bottom-8 w-0.5 bg-gray-100 dark:bg-gray-800" />
                    
                    <div className="space-y-8 relative">
                        {steps.map((step) => {
                            const isActive = currentStep === step.id;
                            const isPast = currentStep > step.id;
                            
                            return (
                                <div key={step.id} className="flex gap-5 relative z-10">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-[3px] bg-white dark:bg-gray-900 ${
                                            isActive ? 'border-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.1)]' : 
                                            isPast ? 'border-green-500 bg-green-500' : 
                                            'border-gray-200 dark:border-gray-700'
                                        }`}>
                                            {isPast && <span className="material-symbols-outlined text-[12px] text-white font-bold">check</span>}
                                            {isActive && <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}
                                        </div>
                                    </div>
                                    <div className={`-mt-1 ${!isPast && !isActive ? 'opacity-40' : ''}`}>
                                        <h4 className={`font-bold text-[15px] ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                                            {step.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{step.subtitle}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Summary Section */}
                {orderDetails && (
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Bill Details</h3>
                        <div className="space-y-3 mb-4">
                            {orderDetails.items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-start text-sm">
                                    <div className="flex gap-2 text-gray-700 dark:text-gray-300">
                                        <span className="border border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20 text-[10px] h-4 w-4 flex items-center justify-center rounded-sm">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                        </span>
                                        <span>{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                            <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
                            <span className="font-black text-lg text-gray-900 dark:text-white">₹{orderDetails.totalAmount?.toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </motion.div>
        </main>
    );
}

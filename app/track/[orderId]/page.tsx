"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TrackOrder() {
    const [progress, setProgress] = useState(25);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        const timer1 = setTimeout(() => {
            setProgress(50);
            setCurrentStep(2);
        }, 3000);

        const timer2 = setTimeout(() => {
            setProgress(75);
            setCurrentStep(3);
        }, 7000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    const steps = [
        { id: 1, title: "Order Placed", time: "12:30 PM", icon: "receipt_long" },
        { id: 2, title: "Preparing", time: "12:35 PM", icon: "skillet" },
        { id: 3, title: "On the Way", time: "Pending", icon: "two_wheeler" },
        { id: 4, title: "Delivered", time: "Est. 1:15 PM", icon: "home" },
    ];

    return (
        <main className="bg-background-light dark:bg-background-dark min-h-screen pb-10 font-display">
            {/* Map Mockup Background */}
            <div className="relative h-72 w-full overflow-hidden">
                {/* Animated gradient map background */}
                <motion.div
                    animate={{
                        background: [
                            "linear-gradient(135deg, #002366 0%, #003399 50%, #001a4d 100%)",
                            "linear-gradient(135deg, #001a4d 0%, #002366 50%, #003399 100%)",
                            "linear-gradient(135deg, #003399 0%, #001a4d 50%, #002366 100%)",
                        ],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute inset-0"
                />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            "url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23d4af35%22 fill-opacity=%220.3%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
                    }}
                />

                {/* Animated Route */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="none"
                >
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: progress > 50 ? 1 : progress / 100 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        d="M 50 220 Q 150 160 200 110 T 350 60"
                        fill="none"
                        stroke="#d4af35"
                        strokeWidth="3"
                        strokeDasharray="8 8"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Animated Pin */}
                <motion.div
                    initial={{ scale: 0, y: -30 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                >
                    {/* Pulse ring */}
                    <motion.div
                        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary/30 rounded-full"
                    />
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl border-3 border-primary relative z-10">
                        <span className="material-symbols-outlined text-terracotta text-2xl">
                            local_dining
                        </span>
                    </div>
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shadow-md" />
                </motion.div>

                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-4 left-4 z-10"
                >
                    <Link href="/">
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 bg-white/15 backdrop-blur-lg border border-white/20 rounded-full flex items-center justify-center shadow-lg text-white"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </motion.div>
                    </Link>
                </motion.div>
            </div>

            {/* Tracking Details Card */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="relative -mt-8 bg-white dark:bg-background-dark rounded-t-3xl px-5 pt-9 pb-10 premium-shadow-lg"
            >
                {/* Handle */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <p className="text-slate-500 font-medium text-sm">
                            Estimated Delivery
                        </p>
                        <h1 className="text-4xl font-black text-royal-blue dark:text-white mt-1">
                            1:15 <span className="text-lg">PM</span>
                        </h1>
                    </div>
                    <motion.div
                        key={currentStep}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <p className="text-sm font-bold text-terracotta bg-terracotta/10 px-4 py-1.5 rounded-full">
                            {currentStep === 1
                                ? "Order Received"
                                : currentStep === 2
                                    ? "In Kitchen"
                                    : "On the Way"}
                        </p>
                    </motion.div>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-9 overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary via-saffron to-primary rounded-full relative"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "anticipate" }}
                    >
                        {/* Shimmer on progress bar */}
                        <div className="absolute inset-0 shimmer-bg" />
                    </motion.div>
                </div>

                {/* Timeline */}
                <div className="space-y-0">
                    {steps.map((step, index) => {
                        const isActive = currentStep >= step.id;
                        const isCurrent = currentStep === step.id;
                        return (
                            <div key={step.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <motion.div
                                        animate={{
                                            scale: isCurrent ? [1, 1.15, 1] : 1,
                                            backgroundColor: isActive ? "#d4af35" : "#e2e8f0",
                                        }}
                                        transition={
                                            isCurrent
                                                ? { duration: 1.5, repeat: Infinity }
                                                : { duration: 0.3 }
                                        }
                                        className={`w-11 h-11 rounded-full flex items-center justify-center z-10 ${isActive
                                                ? "text-royal-blue shadow-lg shadow-primary/30"
                                                : "text-slate-400 dark:bg-slate-800"
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {step.icon}
                                        </span>
                                    </motion.div>
                                    {index !== steps.length - 1 && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 40 }}
                                            transition={{ delay: index * 0.2, duration: 0.5 }}
                                            className={`w-0.5 mt-2 ${isActive && currentStep > step.id
                                                    ? "bg-primary"
                                                    : "bg-slate-200 dark:bg-slate-800"
                                                }`}
                                        />
                                    )}
                                </div>
                                <div
                                    className={`mt-2 ${isActive ? "opacity-100" : "opacity-40"}`}
                                >
                                    <h4
                                        className={`font-bold ${isActive
                                                ? "text-royal-blue dark:text-white"
                                                : "text-slate-500"
                                            }`}
                                    >
                                        {step.title}
                                        {isCurrent && (
                                            <motion.span
                                                animate={{ opacity: [1, 0.3, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="inline-block ml-2 text-xs text-primary"
                                            >
                                                ● Live
                                            </motion.span>
                                        )}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1">{step.time}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Delivery Hero Info */}
                {currentStep >= 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="mt-8 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-between glow-border"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img
                                    src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                                    className="w-13 h-13 rounded-full border-2 border-primary object-cover"
                                    alt="Driver"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-royal-blue dark:text-white text-sm">
                                    Ahmed Raza
                                </p>
                                <div className="flex items-center text-xs text-slate-500">
                                    <span className="material-symbols-outlined text-[14px] text-primary fill-1">
                                        star
                                    </span>
                                    <span className="font-bold ml-1">4.9</span>
                                    <span className="mx-1">•</span>
                                    <span>Royal Express</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center text-royal-blue dark:text-primary shadow-sm"
                            >
                                <span className="material-symbols-outlined">message</span>
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-royal-blue shadow-sm"
                            >
                                <span className="material-symbols-outlined">call</span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </main>
    );
}

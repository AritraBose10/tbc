"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Hide loading screen after 2.5 seconds
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    key="loading-screen"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background-light dark:bg-background-dark mughal-pattern"
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
                        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                        className="relative w-40 h-40 mb-8"
                    >
                        {/* Glow effect behind logo */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                        />

                        <motion.div
                            animate={{
                                y: [-8, 8, -8],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative w-full h-full"
                        >
                            <Image
                                src="/image.png"
                                alt="The Biryani Canteen Logo"
                                fill
                                className="object-contain drop-shadow-2xl"
                                priority
                            />
                        </motion.div>
                    </motion.div>

                    {/* Loading Indicator */}
                    <div className="flex flex-col items-center">
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="text-royal-blue dark:text-primary font-bold tracking-widest uppercase text-sm mb-4"
                        >
                            Cooking Perfection
                        </motion.div>

                        <div className="flex gap-2">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        y: [0, -10, 0],
                                        scale: [1, 1.2, 1],
                                        backgroundColor: ["#002366", "#d4af35", "#002366"]
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                        ease: "easeInOut"
                                    }}
                                    className="w-2.5 h-2.5 rounded-full dark:bg-white"
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

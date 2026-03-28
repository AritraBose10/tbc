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
                    exit={{ 
                        opacity: 0,
                        transition: { 
                            duration: 0.3,
                            delay: 0.5 // Match logo zoom duration (no extra gap)
                        }
                    }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FFD700]"
                >
                    <div className="relative flex flex-col items-center">
                        {/* Logo Container */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ 
                                scale: 1, 
                                opacity: 1,
                                transition: {
                                    duration: 0.5,
                                    ease: "easeOut"
                                }
                            }}
                            exit={{ 
                                scale: 15, // Huge zoom outwards to cover screen
                                opacity: 0,
                                transition: {
                                    duration: 0.5, // Fast zoom as requested
                                    ease: [0.32, 0, 0.67, 0] // Accelerating ease-in
                                }
                            }}
                            className="relative w-48 h-48 md:w-64 md:h-64"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative w-full h-full"
                            >
                                <Image
                                    src="/image.png"
                                    alt="The Biryani Canteen Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

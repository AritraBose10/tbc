"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function TrackingRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to a default mock order ID for tracking
        const timer = setTimeout(() => {
            router.push("/track/RHA-3940");
        }, 2000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 mughal-pattern text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-8"
            >
                <motion.span
                    animate={{
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="material-symbols-outlined text-5xl text-primary"
                >
                    shopping_bag
                </motion.span>
            </motion.div>

            <h1 className="text-3xl font-black text-royal-blue dark:text-white mb-4 tracking-tight">
                Preparing Your Feast
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                Your order has been received and sent to the royal kitchen. Redirecting you to the live tracker...
            </p>

            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -10, 0],
                            opacity: [0.3, 1, 0.3]
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2
                        }}
                        className="w-2 h-2 bg-primary rounded-full"
                    />
                ))}
            </div>

            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/track/RHA-3940")}
                className="mt-12 text-primary font-black text-xs uppercase tracking-widest border-b-2 border-primary/20 pb-1"
            >
                Click here if you aren't redirected
            </motion.button>
        </main>
    );
}

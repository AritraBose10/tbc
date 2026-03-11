"use client";

import { motion } from "framer-motion";

export default function OrnamentalSeparator() {
    return (
        <motion.div
            className="flex justify-center py-8"
        >
            <div className="flex items-center gap-4 text-primary">
                <motion.div
                    className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/60"
                />
                <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="material-symbols-outlined text-primary/80 scale-75"
                >
                    star_rate
                </motion.span>
                <motion.div
                    className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/60"
                />
            </div>
        </motion.div>
    );
}

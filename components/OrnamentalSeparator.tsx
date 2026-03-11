"use client";

import { motion } from "framer-motion";

export default function OrnamentalSeparator() {
    return (
        <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center py-8"
        >
            <div className="flex items-center gap-4 text-primary">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: 48 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="h-[1px] bg-gradient-to-r from-transparent to-primary/60"
                />
                <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="material-symbols-outlined text-primary/80 scale-75"
                >
                    star_rate
                </motion.span>
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: 48 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="h-[1px] bg-gradient-to-l from-transparent to-primary/60"
                />
            </div>
        </motion.div>
    );
}

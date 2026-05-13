"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CompleteProfileForm({
    nextUrl,
    email,
}: {
    nextUrl: string;
    email: string;
}) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        if (!name.trim()) { setError("Please enter your full name."); return; }
        if (!/^\d{10}$/.test(phone)) { setError("Please enter a valid 10-digit mobile number."); return; }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), phone }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed to save");
            router.push(nextUrl);
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#FFFDF0] dark:bg-background-dark flex flex-col items-center justify-center px-5 mughal-pattern font-display">
            {/* Brand */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center mb-10"
            >
                <div className="w-16 h-16 bg-[#0A2647] rounded-2xl flex items-center justify-center mb-3 premium-shadow">
                    <span className="material-symbols-outlined text-3xl text-primary">restaurant</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">The Biryani Canteen</h1>
                <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase mt-1">Royal Indian Cuisine</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full max-w-sm"
            >
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 premium-shadow ring-1 ring-slate-100 dark:ring-slate-800">
                    {/* Signed-in as badge */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 mb-5">
                        <span className="material-symbols-outlined text-slate-400 text-sm">mail</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{email}</span>
                    </div>

                    <h2 className="text-xl font-black text-slate-800 dark:text-white mb-1">Complete your profile</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        We need your name and number to process orders.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError(""); }}
                                placeholder="Your full name"
                                required
                                autoFocus
                                autoComplete="name"
                                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">
                                Mobile Number
                            </label>
                            <div className="flex gap-2">
                                <span className="px-3 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-bold border border-slate-200 dark:border-slate-700 shrink-0">
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={phone}
                                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                                    placeholder="10-digit number"
                                    required
                                    autoComplete="tel"
                                    className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-red-500 font-semibold flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-sm">error</span>
                                {error}
                            </motion.p>
                        )}

                        <motion.button
                            type="submit"
                            disabled={loading || !name || phone.length < 10}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3.5 rounded-2xl bg-[#0A2647] text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    Continue
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </main>
    );
}

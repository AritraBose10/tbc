"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Step = "email" | "otp";

export default function LoginForm({ nextUrl }: { nextUrl: string }) {
    const router = useRouter();

    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendTimer, setResendTimer] = useState(0);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (resendTimer <= 0) return;
        const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
        return () => clearInterval(id);
    }, [resendTimer]);

    async function handleSendOtp(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed to send OTP");
            setStep("otp");
            setResendTimer(30);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        const otpValue = otp.join("");
        if (otpValue.length < 6) {
            setError("Please enter all 6 digits");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpValue }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Verification failed");
            // New users (no name/phone yet) must complete their profile first
            const profileIncomplete = !data.user.name || !data.user.phone;
            const dest = profileIncomplete
                ? `/complete-profile?next=${encodeURIComponent(nextUrl)}`
                : nextUrl;
            router.push(dest);
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setOtp(["", "", "", "", "", ""]);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } finally {
            setLoading(false);
        }
    }

    function handleOtpChange(index: number, value: string) {
        if (value.length > 1) {
            const digits = value.replace(/\D/g, "").slice(0, 6).split("");
            const newOtp = [...otp];
            digits.forEach((d, i) => {
                if (index + i < 6) newOtp[index + i] = d;
            });
            setOtp(newOtp);
            otpRefs.current[Math.min(index + digits.length, 5)]?.focus();
            return;
        }
        const digit = value.replace(/\D/g, "");
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        if (digit && index < 5) otpRefs.current[index + 1]?.focus();
    }

    function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    }

    async function handleResend() {
        if (resendTimer > 0) return;
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed to resend");
            setOtp(["", "", "", "", "", ""]);
            setResendTimer(30);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Resend failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#FFFDF0] dark:bg-background-dark flex flex-col items-center justify-center px-5 mughal-pattern font-display">
            {/* Logo / Brand */}
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

            <AnimatePresence mode="wait">
                {step === "email" ? (
                    <motion.div
                        key="email-step"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className="w-full max-w-sm"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 premium-shadow ring-1 ring-slate-100 dark:ring-slate-800">
                            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-1">Sign In</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                Enter your email to receive a one-time code.
                            </p>
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="email"
                                        autoFocus
                                        className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
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
                                    disabled={loading || !email}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3.5 rounded-2xl bg-[#0A2647] text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                            Sending…
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">send</span>
                                            Send OTP
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </div>

                        <p className="text-center text-xs text-slate-400 mt-6">
                            By continuing, you agree to our{" "}
                            <Link href="#" className="text-primary font-semibold">Terms</Link>
                            {" "}and{" "}
                            <Link href="#" className="text-primary font-semibold">Privacy Policy</Link>.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="otp-step"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        className="w-full max-w-sm"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 premium-shadow ring-1 ring-slate-100 dark:ring-slate-800">
                            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl px-3 py-2 mb-5">
                                <span className="material-symbols-outlined text-sm">mark_email_read</span>
                                <span className="text-xs font-bold">Code sent to <span className="underline underline-offset-2">{email}</span></span>
                            </div>

                            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-1">Enter OTP</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                Check your inbox for the 6-digit code.
                            </p>

                            <form onSubmit={handleVerifyOtp} className="space-y-5">
                                <div className="flex gap-2 justify-between">
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { otpRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className="w-11 h-14 text-center text-xl font-black rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:bg-primary/5 transition-all"
                                        />
                                    ))}
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
                                    disabled={loading || otp.join("").length < 6}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3.5 rounded-2xl bg-[#0A2647] text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                            Verifying…
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">verified_user</span>
                                            Verify & Sign In
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={() => { setStep("email"); setError(""); setOtp(["", "", "", "", "", ""]); }}
                                    className="text-xs text-slate-500 font-semibold flex items-center gap-1 hover:text-slate-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                    Change email
                                </button>
                                <button
                                    onClick={handleResend}
                                    disabled={resendTimer > 0 || loading}
                                    className="text-xs font-bold text-primary disabled:text-slate-400 transition-colors"
                                >
                                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

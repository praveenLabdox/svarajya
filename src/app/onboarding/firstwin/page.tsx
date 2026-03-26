"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Award, Crown } from "lucide-react";
import { OnboardingStore } from "@/lib/onboardingStore";

const LAST_LOGIN_KEY = "svarajya_last_login";

const PRIORITIES = [
    { id: "save", label: "Savings", icon: "🏦", desc: "Build a safety net and grow reserves" },
    { id: "protect", label: "Family Security", icon: "🛡️", desc: "Insurance, nominees, and legacy" },
    { id: "grow", label: "Growth", icon: "📈", desc: "Investments and wealth building" },
    { id: "organise", label: "Organisation", icon: "🗂️", desc: "Documents, clarity, and control" },
];

function FirstWinContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isReturning = searchParams.get("returning") === "true";
    const [priority, setPriority] = useState("");
    // Name starts as "Ruler" fallback, then gets replaced with real name from DB
    const [firstName, setFirstName] = useState("Ruler");
    const lastLoginDisplay = (() => {
        if (typeof window === "undefined") return null;
        const stored = localStorage.getItem(LAST_LOGIN_KEY);
        if (!stored || !isReturning) return null;
        const d = new Date(stored);
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    })();

    useEffect(() => {
        // Fetch name directly from DB — in-memory OnboardingStore is empty on fresh page load
        fetch("/api/profile")
            .then(r => (r.ok ? r.json() : null))
            .then(profile => {
                if (profile?.fullName) {
                    setFirstName(profile.fullName.split(" ")[0]);
                } else {
                    // Fallback: check in-memory store (works during same session)
                    const stored = OnboardingStore.get().fullName;
                    if (stored) setFirstName(stored.split(" ")[0]);
                }
            })
            .catch(() => {
                const stored = OnboardingStore.get().fullName;
                if (stored) setFirstName(stored.split(" ")[0]);
            });
     
    }, []);

    const handleFinish = () => {
        if (priority) OnboardingStore.set({ priority });
        localStorage.setItem(LAST_LOGIN_KEY, new Date().toISOString());
        router.push("/dashboard");
    };


    // --- RETURNING USER VIEW ---
    if (isReturning) {
        return (
            <div className="flex flex-col min-h-screen p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-400/6 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col min-h-screen items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-24 h-24 rounded-full bg-amber-400/15 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.3)] mb-6"
                    >
                        <Crown className="w-12 h-12 text-amber-400" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-center space-y-2 mb-8"
                    >
                        <p className="text-xs text-amber-400/70 uppercase tracking-widest">Welcome Back</p>
                        <h1 className="text-3xl font-display text-amber-400">{firstName}</h1>
                        <p className="text-white/60 text-sm">Your Rajya awaits your command.</p>
                        {lastLoginDisplay && (
                            <p className="text-white/30 text-xs mt-2">
                                Last session: {lastLoginDisplay}
                            </p>
                        )}
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        onClick={() => {
                            localStorage.setItem(LAST_LOGIN_KEY, new Date().toISOString());
                            router.push("/dashboard");
                        }}
                        className="w-full max-w-xs bg-amber-400 text-black font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-amber-300 transition-colors"
                    >
                        Enter Rajya
                    </motion.button>
                </div>
            </div>
        );
    }

    // --- NEW USER / FIRST-TIME VIEW ---
    return (
        <div className="flex flex-col min-h-screen p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-400/6 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <div className="pt-10 flex flex-col items-center space-y-4">
                    {/* Badge */}
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="w-24 h-24 rounded-full bg-amber-400/15 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.3)]">
                            <Award className="w-12 h-12 text-amber-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-xs">✓</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-center space-y-1"
                    >
                        <p className="text-xs text-amber-400/70 uppercase tracking-widest">Foundation Badge</p>
                        <h1 className="text-2xl font-semibold text-white">Rajya Foundation Complete</h1>
                    </motion.div>

                    {/* Strength bar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-center"
                    >
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Rajya Strength</p>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                            <motion.div
                                className="h-full bg-amber-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                            />
                        </div>
                        <p className="text-amber-400 font-bold text-lg">100%</p>
                        <p className="text-white/40 text-xs mt-1">
                            You have established the base of your financial kingdom.
                        </p>
                    </motion.div>
                </div>

                {/* Priority selector */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="mt-6 flex-1 flex flex-col justify-center"
                >
                    <p className="text-sm text-white/60 text-center mb-4">
                        Next: choose your first priority.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pb-8">
                        {PRIORITIES.map(p => (
                            <button
                                key={p.id}
                                onClick={() => {
                                    setPriority(p.id);
                                    OnboardingStore.set({ priority: p.id });
                                    localStorage.setItem(LAST_LOGIN_KEY, new Date().toISOString());
                                    setTimeout(() => router.push("/dashboard"), 300);
                                }}
                                className={`p-3 rounded-xl border text-left transition-all hover:-translate-y-1 ${priority === p.id
                                    ? "bg-amber-400/15 border-amber-400"
                                    : "bg-white/5 border-white/10 hover:border-amber-400/30"
                                    }`}
                            >
                                <span className="text-xl">{p.icon}</span>
                                <p className={`text-sm font-medium mt-1 ${priority === p.id ? "text-amber-400" : "text-white"}`}>
                                    {p.label}
                                </p>
                                <p className="text-xs text-white/35 mt-0.5 leading-tight">{p.desc}</p>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Welcome hint */}
                {firstName && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-center text-white/35 text-xs pb-6">
                        Welcome to Sva-Rajya, {firstName}. Tap a priority above to enter your Rajya.
                    </motion.p>
                )}
            </div>
        </div>
    );
}

export default function FirstWin() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a1628]" />}>
            <FirstWinContent />
        </Suspense>
    );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MessageSquareOff, Landmark, ShieldCheck } from "lucide-react";

const TRUST_ICONS = [
    { icon: <MessageSquareOff className="w-4 h-4" />, label: "No SMS reading" },
    { icon: <Landmark className="w-4 h-4" />, label: "No bank scraping" },
    { icon: <ShieldCheck className="w-4 h-4" />, label: "No ads, ever" },
];

export default function SilentAuthority() {
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const navigated = useRef(false);

    // Tick the progress bar
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 2;
            });
        }, 60);
        return () => clearInterval(interval);
    }, []);

    // Navigate when progress completes — outside of setState
    useEffect(() => {
        if (progress >= 100 && !navigated.current) {
            navigated.current = true;
            router.push("/onboarding");
        }
    }, [progress, router]);

    return (
        <div className="flex flex-col min-h-screen items-center justify-between p-8 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/6 blur-[100px] rounded-full pointer-events-none" />

            {/* Skip */}
            <div className="relative z-10 w-full flex justify-end pt-2">
                <button
                    onClick={() => router.push("/onboarding")}
                    className="text-white/30 text-xs hover:text-white/60 transition-colors py-2 px-3"
                >
                    Skip
                </button>
            </div>

            {/* Central logo mark */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center space-y-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="text-center space-y-3"
                >
                    {/* Logo emblem */}
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.12)]">
                        <span className="text-3xl">⚖️</span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        <h1 className="font-display text-4xl text-amber-400 leading-none tracking-wide">
                            Sva-Rajya
                        </h1>
                        <p className="text-white/45 text-sm mt-2 tracking-wide">
                            Your financial command centre.
                        </p>
                    </motion.div>
                </motion.div>
            </div>

            {/* Bottom trust strip + progress */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="relative z-10 w-full space-y-5"
            >
                {/* 3 Trust icons */}
                <div className="flex items-center justify-center gap-5">
                    {TRUST_ICONS.map((t, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                            <div className="w-8 h-8 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center text-white/40">
                                {t.icon}
                            </div>
                            <span className="text-[9px] text-white/30 text-center leading-tight max-w-[56px]">
                                {t.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Auto-advance progress bar */}
                <div className="space-y-2">
                    <div className="h-[2px] w-full bg-white/8 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-amber-400/60 rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-center text-[10px] text-white/25">
                        Local-first • No SMS reading • No bank scraping
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

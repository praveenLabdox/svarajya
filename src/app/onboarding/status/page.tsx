"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OnboardingStore } from "@/lib/onboardingStore";

const OPTIONS = ["Single", "Married", "Other", "Prefer not to say"];

function ProgressBar({ step }: { step: number }) {
    return (
        <div className="flex items-center gap-2 mt-3">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-amber-400" : "bg-white/10"}`} />
            ))}
        </div>
    );
}

export default function StatusStep() {
    const router = useRouter();
    const [selected, setSelected] = useState("");
    const [placed, setPlaced] = useState(false);

    useEffect(() => {
        const stored = OnboardingStore.get();
        if (stored.maritalStatus) setSelected(stored.maritalStatus);
    }, []);

    const handleSelect = (opt: string) => {
        setSelected(opt);
        OnboardingStore.set({ maritalStatus: opt });
        setPlaced(true);
        setTimeout(() => router.push("/onboarding/occupation"), 800);
    };

    return (
        <div className="flex flex-col min-h-screen p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Back + step */}
                <div className="flex items-center gap-2 pt-10 mb-2">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0">
                        <ArrowLeft className="w-4 h-4 text-white/60" />
                    </button>
                    <p className="text-xs text-amber-400/70 uppercase tracking-widest">Step 3 of 5</p>
                </div>
                <ProgressBar step={3} />

                <div className="flex-1 flex flex-col justify-center space-y-8">
                    <div className="flex justify-center">
                        <svg width="180" height="80" viewBox="0 0 180 80">
                            <rect x="75" y="40" width="30" height="28" rx="2" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.3)" strokeWidth="1.5" />
                            <rect x="78" y="28" width="24" height="14" rx="2" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.25)" strokeWidth="1" />
                            <rect x="25" y="46" width="22" height="22" rx="2" fill="rgba(251,191,36,0.05)" stroke={selected && selected !== "Single" ? "rgba(251,191,36,0.5)" : "rgba(251,191,36,0.15)"} strokeWidth="1" />
                            <rect x="52" y="46" width="18" height="22" rx="2" fill="rgba(251,191,36,0.04)" stroke={selected && selected !== "Single" ? "rgba(251,191,36,0.4)" : "rgba(251,191,36,0.12)"} strokeWidth="1" />
                            <rect x="110" y="46" width="18" height="22" rx="2" fill="rgba(251,191,36,0.04)" stroke={selected && selected !== "Single" ? "rgba(251,191,36,0.4)" : "rgba(251,191,36,0.12)"} strokeWidth="1" />
                            <rect x="133" y="46" width="22" height="22" rx="2" fill="rgba(251,191,36,0.05)" stroke={selected && selected !== "Single" ? "rgba(251,191,36,0.5)" : "rgba(251,191,36,0.15)"} strokeWidth="1" />
                            <line x1="10" y1="68" x2="170" y2="68" stroke="rgba(251,191,36,0.15)" strokeWidth="1" />
                        </svg>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h1 className="text-xl font-semibold text-white mb-1">Choose your Council style.</h1>
                            <p className="text-xs text-white/40">You can always skip — this is your Rajya.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {OPTIONS.map(opt => (
                                <motion.button key={opt} whileTap={{ scale: 0.97 }} onClick={() => handleSelect(opt)}
                                    className={`py-4 rounded-xl border text-sm font-medium transition-all ${selected === opt ? "bg-amber-400/15 border-amber-400 text-amber-400" : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                                        }`}>
                                    {opt}
                                </motion.button>
                            ))}
                        </div>
                        {placed && selected && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 text-sm text-center">
                                ✓ Council hall assembled.
                            </motion.p>
                        )}
                    </div>
                </div>

                <div className="pb-4">
                    <button onClick={() => router.push("/onboarding/occupation")} className="w-full text-white/35 text-sm py-3 hover:text-white/60 transition-colors">
                        Skip this step
                    </button>
                </div>
            </div>
        </div>
    );
}

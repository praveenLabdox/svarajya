"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

const TRUST_CARDS = [
    {
        id: "sms",
        title: "No SMS Reading",
        summary: "We will never read OTPs, bank SMS, or personal messages.",
        detail:
            "Sva-Rajya does not request SMS permissions. Every detail you enter is typed manually by you. We have no access to your messages inbox — ever.",
    },
    {
        id: "bank",
        title: "No Bank Scraping",
        summary: "We won't connect to your bank or pull transactions automatically.",
        detail:
            "There is no bank login, no account linking, and no screen scraping. Your financial data is what you choose to tell us — nothing more. You remain in control.",
    },
    {
        id: "data",
        title: "You Control Your Data",
        summary: "Your data stays on your device. Cloud backup is your choice.",
        detail:
            "All data is stored locally on your device by default. Cloud sync is optional and requires your explicit action. You can export or delete everything at any time.",
    },
];

export default function TrustDeclaration() {
    const router = useRouter();
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [showError, setShowError] = useState(false);

    const handleContinue = () => {
        if (!agreed) {
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            return;
        }
        router.push("/onboarding/intro");
    };

    return (
        <div className="flex flex-col min-h-screen p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <div className="pt-10 pb-8">
                    <p className="text-xs text-amber-400/70 uppercase tracking-widest mb-2">Before we begin</p>
                    <h1 className="text-2xl font-semibold text-white leading-snug">
                        Your privacy is<br />non-negotiable.
                    </h1>
                </div>

                {/* Trust Cards */}
                <div className="space-y-3 flex-1">
                    {TRUST_CARDS.map((card) => {
                        const isOpen = expandedCard === card.id;
                        return (
                            <motion.div
                                key={card.id}
                                layout
                                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                            >
                                <button
                                    className="w-full flex items-center justify-between p-4 text-left"
                                    onClick={() => setExpandedCard(isOpen ? null : card.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-white">{card.title}</p>
                                            <p className="text-xs text-white/45 mt-0.5">{card.summary}</p>
                                        </div>
                                    </div>
                                    {isOpen ? (
                                        <ChevronUp className="w-4 h-4 text-white/30 shrink-0 ml-2" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-white/30 shrink-0 ml-2" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="px-4 pb-4"
                                        >
                                            <p className="text-sm text-white/55 leading-relaxed border-t border-white/8 pt-3">
                                                {card.detail}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Checkbox + CTA */}
                <div className="pt-6 pb-4 space-y-4">
                    <button
                        onClick={() => setAgreed(!agreed)}
                        className="w-full flex items-center gap-3 text-left"
                    >
                        <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${agreed
                                ? "bg-amber-400 border-amber-400"
                                : "border-white/30 bg-transparent"
                                }`}
                        >
                            {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                        </div>
                        <span className="text-sm text-white/70">I understand and agree.</span>
                    </button>

                    {/* Error toast */}
                    <AnimatePresence>
                        {showError && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-xl text-center"
                            >
                                This is required to continue.
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleContinue}
                        className={`w-full py-4 rounded-xl font-semibold text-sm transition-all ${agreed
                            ? "bg-amber-400 text-black hover:bg-amber-300"
                            : "bg-white/8 text-white/30 cursor-not-allowed"
                            }`}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

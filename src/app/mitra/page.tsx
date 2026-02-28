"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MicroLearningWrapper } from "@/components/module/MicroLearningWrapper";
import { Users, FileMinus, FileCheck } from "lucide-react";
import { motion } from "framer-motion";
import { VideoTutorialPlaceholder } from "@/components/ui/VideoTutorialPlaceholder";

export default function MitraModule() {
    const router = useRouter();
    const [hasWill, setHasWill] = useState<boolean | null>(null);
    const [step, setStep] = useState<"question" | "review">("question");

    const handleAnswer = (val: boolean) => {
        setHasWill(val);
        setStep("review");
    };

    const handleFinish = () => {
        console.log("Mitra Locked:", { hasWill });
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen py-12 px-6">
            <MicroLearningWrapper
                moduleTitle="The Mitra (Legacy & Succession)"
                contextText="A kingdom without a designated heir invites chaos the moment the king falls. Your assets mean nothing if your family cannot legally access them."
                insightText="In India, over ₹82,000 Crores (approx $10 Billion) lies unclaimed in banks and insurance companies simply because nominees were not updated."
                quizQuestion="Are nominees the final legal heirs to an asset?"
                quizOptions={[
                    { label: "Yes, the nominee owns the money instantly", isCorrect: false },
                    { label: "No, a nominee is just a trustee. A registered Will determines the final heir.", isCorrect: true },
                    { label: "Only if the asset is in a joint account", isCorrect: false }
                ]}
                onDataCaptureUnlock={() => console.log("Mitra Unlock!")}
            >
                {step === "question" ? (
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <h3 className="text-xl text-[var(--color-rajya-accent)] flex justify-center gap-2 items-center">
                                <Users className="w-6 h-6" /> Declare The Heir
                            </h3>
                            <p className="text-sm text-[var(--color-rajya-muted)]">Does your Rajya have a registered, legally binding Will?</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                            <button
                                onClick={() => handleAnswer(true)}
                                className="bg-[var(--color-rajya-card)] border border-white/10 hover:border-[var(--color-rajya-accent)] text-[var(--color-rajya-text)] p-6 rounded-xl transition-all flex flex-col items-center gap-4"
                            >
                                <FileCheck className="w-8 h-8 text-[var(--color-rajya-success)]" />
                                <span className="font-medium">Yes, Legally Sealed</span>
                            </button>

                            <button
                                onClick={() => handleAnswer(false)}
                                className="bg-[var(--color-rajya-card)] border border-white/10 hover:border-[var(--color-rajya-danger)] text-[var(--color-rajya-text)] p-6 rounded-xl transition-all flex flex-col items-center gap-4"
                            >
                                <FileMinus className="w-8 h-8 text-[var(--color-rajya-danger)]/70" />
                                <span className="font-medium">No, or Unsure</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8 flex flex-col items-center"
                    >
                        <div className="text-center space-y-4 max-w-[280px]">
                            {hasWill ? (
                                <div className="space-y-4">
                                    <FileCheck className="w-16 h-16 mx-auto text-[var(--color-rajya-success)]" />
                                    <h3 className="text-xl text-[var(--color-rajya-text)] font-display">Succession Secured</h3>
                                    <p className="text-[var(--color-rajya-muted)] text-sm">
                                        Your legacy is protected. Ensure your family knows where the physical seal (document) is kept.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <FileMinus className="w-16 h-16 mx-auto text-[var(--color-rajya-danger)]" />
                                    <h3 className="text-xl text-[var(--color-rajya-text)] font-display">Kingdom at Risk</h3>
                                    <p className="text-[var(--color-rajya-danger)]/90 text-sm bg-[var(--color-rajya-danger)]/10 p-4 rounded-xl border border-[var(--color-rajya-danger)]/20">
                                        Without a written decree, the law — not your wishes — will divide your Rajya. This is your highest priority vulnerability.
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleFinish}
                            className="w-full max-w-xs flex items-center justify-center gap-2 bg-[var(--color-rajya-accent)] text-black py-4 rounded-xl font-bold font-display uppercase tracking-widest hover:opacity-90"
                        >
                            Seal Module
                        </button>
                    </motion.div>
                )}
            </MicroLearningWrapper>

            {/* YouTube Tutorial */}
            <div className="mt-6">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">🎓 Learn More</p>
                <VideoTutorialPlaceholder youtubeId="GnxYjBU9E_U" label="How to write a Will in India — estate planning basics" />
            </div>
        </div>
    );
}

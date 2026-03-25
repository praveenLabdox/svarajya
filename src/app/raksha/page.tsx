"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MicroLearningWrapper } from "@/components/module/MicroLearningWrapper";
import { SelectGridGame } from "@/components/module/SelectGridGame";
import { Shield, HeartPulse, Home, Car } from "lucide-react";
import { motion } from "framer-motion";
import { VideoTutorialPlaceholder } from "@/components/ui/VideoTutorialPlaceholder";

const RAKSHA_TYPES = [
    { id: 'term', label: 'Term (Life)', icon: <Shield /> },
    { id: 'health', label: 'Health', icon: <HeartPulse /> },
    { id: 'vehicle', label: 'Vehicle', icon: <Car /> },
    { id: 'property', label: 'Property', icon: <Home /> },
];

export default function RakshaModule() {
    const router = useRouter();
    const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
    const [step, setStep] = useState<"identify" | "review">("identify");

    const handleIdentify = (ids: string[]) => {
        setSelectedPolicies(ids);
        setStep("review");
    };

    const handleFinish = () => {
        console.log("Raksha Array:", selectedPolicies);
        router.push('/dashboard');
    };

    const hasLifeHealth = selectedPolicies.includes('term') && selectedPolicies.includes('health');

    return (
        <div className="min-h-screen py-12 px-6">
            <MicroLearningWrapper
                moduleTitle="The Raksha (Shield & Fortress)"
                contextText="A kingdom builds its treasury (Kosh), but an invading army — like an unforeseen medical crisis or accident — can pillage it overnight if there are no walls."
                insightText="68% of families who face a sudden medical emergency are forced to liquidate their core assets or take predatory loans due to inadequate Raksha."
                quizQuestion="What is the primary purpose of Raksha (Insurance)?"
                quizOptions={[
                    { label: "To get a return on investment over time", isCorrect: false },
                    { label: "To protect the Kosh from critical, sudden depletion", isCorrect: true },
                    { label: "To save on yearly taxes", isCorrect: false }
                ]}
                onDataCaptureUnlock={() => console.log("Raksha Unlocked")}
            >
                {step === "identify" ? (
                    <SelectGridGame
                        label="Erect The Walls"
                        description="Which shields currently protect your kingdom?"
                        items={RAKSHA_TYPES}
                        multiSelect={true}
                        onSave={handleIdentify}
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8 flex flex-col items-center"
                    >
                        <div className="text-center space-y-4 max-w-[280px]">
                            <Shield className={`w-16 h-16 mx-auto ${hasLifeHealth ? 'text-[var(--color-rajya-success)]' : 'text-[var(--color-rajya-danger)]'}`} />
                            <h3 className="text-xl text-[var(--color-rajya-text)] font-display">
                                Fortress Status
                            </h3>

                            {hasLifeHealth ? (
                                <p className="text-[var(--color-rajya-success)]/90 text-sm bg-[var(--color-rajya-success)]/10 p-4 rounded-xl border border-[var(--color-rajya-success)]/20">
                                    Your core walls (Life & Health) are standing. The foundation is secure against major sieges.
                                </p>
                            ) : (
                                <p className="text-[var(--color-rajya-danger)]/90 text-sm bg-[var(--color-rajya-danger)]/10 p-4 rounded-xl border border-[var(--color-rajya-danger)]/20">
                                    CRITICAL CRACK DETECTED: Without both Term and Health shields, your entire Kosh remains exposed to a single catastrophic event.
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleFinish}
                            className="w-full max-w-xs flex items-center justify-center gap-2 bg-[var(--color-rajya-accent)] text-black py-4 rounded-xl font-bold font-display uppercase tracking-widest hover:opacity-90 transition-opacity"
                        >
                            Acknowledge & Seal
                        </button>
                    </motion.div>
                )}
            </MicroLearningWrapper>

            {/* YouTube Tutorial */}
            <div className="mt-6">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">🎓 Learn More</p>
                <VideoTutorialPlaceholder youtubeId="3Ob3stTkGLs" label="Term insurance & health insurance explained for beginners" />
            </div>
        </div>
    );
}

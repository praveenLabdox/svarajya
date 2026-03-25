"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Users, ShieldAlert, CheckCircle2, ArrowLeft } from "lucide-react";
import { FamilyTreeGame, FamilyMember } from "@/components/module1/FamilyTreeGame";
import { VideoTutorialPlaceholder } from "@/components/ui/VideoTutorialPlaceholder";
import { OnboardingStore } from "@/lib/onboardingStore";

export default function Submodule1B() {
    const router = useRouter();
    const existingFamily = OnboardingStore.get().familyMembers || [];
    const [step, setStep] = useState<"tutorial" | "mandal" | "win">("tutorial");
    const [members, setMembers] = useState<FamilyMember[]>(existingFamily as FamilyMember[]);

    const handleAddMember = (memberData: Omit<FamilyMember, "id">) => {
        const newMember = { ...memberData, id: Math.random().toString(36).substr(2, 9) };
        setMembers([...members, newMember]);
    };

    const handleRemoveMember = (id: string) => {
        setMembers(members.filter(m => m.id !== id));
    };

    const handleSealMandal = () => {
        OnboardingStore.set({ familyMembers: members });
        setStep("win");
    };

    const handleFinish = () => {
        // Navigate to Submodule 1C (Education)
        router.push('/foundation/education');
    };

    // Immediate Insight Calculations
    const dependencyCount = members.filter(m => m.dependent).length;
    const loadIndex = members.length > 0 ? Math.round((dependencyCount / members.length) * 100) : 0;

    return (
        <div className="flex flex-col min-h-screen relative p-6">
            {/* Header */}
            <div className="flex items-center gap-3 pt-8 mb-6">
                <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0">
                    <ArrowLeft className="w-4 h-4 text-white/60" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-white">Family Members</h1>
                    <p className="text-xs text-white/35 mt-0.5">Who depends on you financially?</p>
                </div>
            </div>

            <AnimatePresence mode="wait">

                {/* TUTORIAL T1 */}
                {step === "tutorial" && (
                    <motion.div
                        key="tutorial"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 space-y-12 flex flex-col justify-center"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                                    <Users className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-white">Family Members — Step 2 of 4</h2>
                                    <p className="text-xs text-white/50 mt-0.5">Add up to 5 members</p>
                                </div>
                            </div>
                            <p className="text-sm text-white/55 leading-relaxed">
                                Indian financial planning is deeply family-linked. Knowing who depends on you helps us prioritise your insurance and nomination coverage correctly.
                            </p>
                        </div>

                        <VideoTutorialPlaceholder youtubeId="hU0V-FwTmWk" label="Why family planning matters for financial protection" />

                        <button
                            onClick={() => setStep("mandal")}
                            className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm hover:bg-amber-300 transition-colors"
                        >
                            Add Family Members
                        </button>
                    </motion.div>
                )}

                {/* 1B GAME: FAMILY TREE UI */}
                {step === "mandal" && (
                    <motion.div
                        key="mandal"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="flex-1 flex flex-col pt-4 pb-20 justify-between"
                    >
                        <FamilyTreeGame
                            members={members}
                            onAddMember={handleAddMember}
                            onRemoveMember={handleRemoveMember}
                        />

                        <div className="pt-8">
                            <button
                                onClick={handleSealMandal}
                                className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm hover:bg-amber-300 transition-colors"
                            >
                                Save & Continue
                            </button>
                            {members.length === 0 && (
                                <p className="text-xs text-center text-white/40 mt-2">
                                    You can skip this step and add family members later.
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* IMMEDIATE INSIGHT - DEPENDENCY LOAD */}
                {step === "win" && (
                    <motion.div
                        key="win"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col justify-center space-y-8"
                    >
                        <div className="text-center space-y-3">
                            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                            <h2 className="text-2xl font-semibold text-white">Family Added</h2>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                            <h3 className="text-xs uppercase tracking-widest text-amber-400 mb-3">Financial Dependency Summary</h3>
                            <div className="flex items-end justify-center gap-2 mb-4">
                                <span className="text-5xl font-bold text-white">{dependencyCount}</span>
                                <span className="text-base text-white/50 mb-1">dependants identified</span>
                            </div>

                            {dependencyCount > 0 ? (
                                <div className="text-left bg-red-500/8 border border-red-500/20 p-4 rounded-xl flex gap-3">
                                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-red-400 mb-1">Insurance Gap Detected</p>
                                        <p className="text-xs text-white/50">
                                            {loadIndex}% of your family are financially dependent on you. We&apos;ll prioritise life and health insurance coverage in your next steps.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-white/50 px-4 py-2">
                                    No financial dependants. Your planning focus will be personal growth and investments.
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleFinish}
                            className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm hover:bg-amber-300 transition-colors"
                        >
                            Next: Education & Qualifications
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

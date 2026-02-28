"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, GraduationCap, Camera, CheckCircle2 } from "lucide-react";
import { FileUploader } from "@/components/vault/FileUploader";
import { OnboardingStore } from "@/lib/onboardingStore";
import { PageGuide } from "@/components/ui/PageGuide";
import { VideoTutorialPlaceholder } from "@/components/ui/VideoTutorialPlaceholder";

const STEPS = [
    { id: "family", icon: <Users className="w-5 h-5" />, label: "Family Members", desc: "Who depends on you financially?", route: "/foundation/family" },
    { id: "education", icon: <GraduationCap className="w-5 h-5" />, label: "Education & Qualifications", desc: "Your background and any education loans", route: "/foundation/education" },
];

export default function FoundationHub() {
    const router = useRouter();
    const data = OnboardingStore.get();
    const [photoUploaded, setPhotoUploaded] = useState(false);

    return (
        <div className="flex flex-col min-h-screen p-6 pb-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <div className="flex items-center gap-3 pt-8 mb-8">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center">
                        <ArrowLeft className="w-4 h-4 text-white/60" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-white">Your Profile</h1>
                        <p className="text-xs text-white/35 mt-0.5">A few more details to complete your setup</p>
                    </div>

                    {/* Guide Section */}
                    <PageGuide
                        title="Your Foundation (Sthapana)"
                        description="Complete your personal profile, add family members, and record your education. This forms the base of your financial kingdom."
                        actions={[{ emoji: "👤", label: "Profile" }, { emoji: "👪", label: "Family" }, { emoji: "🎓", label: "Education" }]}
                    />
                    <div className="h-4" />
                </div>

                {/* User identity card — populated from onboarding */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                    <div className="flex items-center gap-4">
                        {/* Profile photo upload */}
                        <div className="relative shrink-0">
                            {photoUploaded ? (
                                <div className="w-14 h-14 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-amber-400" />
                                </div>
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-white/8 border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-0.5 overflow-hidden cursor-pointer">
                                    <Camera className="w-5 h-5 text-white/30" />
                                    <span className="text-[9px] text-white/30">Photo</span>
                                </div>
                            )}
                            {/* Invisible full-cover upload trigger */}
                            <div className="absolute inset-0 opacity-0">
                                <FileUploader
                                    folder="profile"
                                    accept="image/*"
                                    label=""
                                    compact
                                    onUploaded={() => setPhotoUploaded(true)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{data.fullName || "Your Name"}</p>
                            <p className="text-xs text-white/40 mt-0.5">
                                {data.occupationType || "Occupation"} · {data.lifePhase || "Nirmaan"} phase
                            </p>
                            {data.mobile && (
                                <p className="text-xs text-white/30 mt-0.5">+91 {data.mobile}</p>
                            )}
                        </div>
                        <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-full shrink-0 capitalize">
                            {data.priority || "Profile set"}
                        </span>
                    </div>
                    {!photoUploaded && (
                        <p className="text-xs text-white/25 mt-3 text-center">Tap the circle above to add your photo</p>
                    )}
                </div>

                {/* Remaining steps */}
                <p className="text-xs text-white/35 uppercase tracking-wider mb-3">Next steps</p>
                <div className="space-y-3 flex-1">
                    {STEPS.map((step, i) => (
                        <motion.button
                            key={step.id}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => router.push(step.route)}
                            className="w-full bg-white/5 border border-white/10 hover:border-amber-400/40 rounded-2xl p-4 flex items-center gap-4 text-left transition-all"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                                {step.icon}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">{step.label}</p>
                                <p className="text-xs text-white/40 mt-0.5">{step.desc}</p>
                            </div>
                            <span className="text-white/20 text-xl">›</span>
                        </motion.button>
                    ))}
                </div>

                {/* YouTube Tutorial */}
                <div className="mt-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">🎓 Learn More</p>
                    <VideoTutorialPlaceholder youtubeId="hU0V-FwTmWk" label="How to build a strong financial foundation" />
                </div>

                <div className="pb-4 pt-6">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm hover:bg-amber-300 transition-colors"
                    >
                        Go to Dashboard
                    </button>
                    <p className="text-center text-xs text-white/25 mt-2">
                        Family & education can be added anytime
                    </p>
                </div>
            </div>
        </div>
    );
}

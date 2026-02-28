"use client";

import { useRouter } from "next/navigation";
import { MicroLearningWrapper } from "@/components/module/MicroLearningWrapper";
import { NumberInputGame } from "@/components/module/NumberInputGame";
import { VideoTutorialPlaceholder } from "@/components/ui/VideoTutorialPlaceholder";

export default function RinModule() {
    const router = useRouter();

    const handleSave = (val: number) => {
        console.log("Rin Saved:", val);
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen py-12 px-6">
            <MicroLearningWrapper
                moduleTitle="The Rin (Debt Burden)"
                contextText="Borrowing gold from another kingdom is not a sin, but failing to measure the interest is how kings become vassals. Rin is the weight upon your chest."
                insightText="Compound interest is a double-edged sword. Every piece of gold you owe works against you silently while you sleep."
                quizQuestion="Which Rin (Debt) actively threatens the foundation of your Rajya?"
                quizOptions={[
                    { label: "A low-interest long-term mortgage on an appreciating asset", isCorrect: false },
                    { label: "High-interest, unbacked rolling credit card debt", isCorrect: true },
                    { label: "Zero-interest education loans that increase earning capacity", isCorrect: false }
                ]}
                onDataCaptureUnlock={() => console.log("Rin Unlock!")}
            >
                <NumberInputGame
                    label="Estimate Your Chains"
                    description="What is the total monthly tribute (EMI) paid to foreign vaults?"
                    currency={true}
                    onSave={handleSave}
                />
            </MicroLearningWrapper>

            {/* YouTube Tutorial */}
            <div className="mt-6">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">🎓 Learn More</p>
                <VideoTutorialPlaceholder youtubeId="_XBbgOFKnMs" label="How to become debt free — EMI, loans & credit card traps" />
            </div>
        </div>
    );
}

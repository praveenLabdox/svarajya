"use client";

import { useRouter } from "next/navigation";
import { MicroLearningWrapper } from "@/components/module/MicroLearningWrapper";
import { SelectGridGame } from "@/components/module/SelectGridGame";
import { MonitorPlay, Music, Wifi, Box } from "lucide-react";
import { VideoTutorialPlaceholder } from "@/components/ui/VideoTutorialPlaceholder";

const SUBSCRIPTIONS = [
    { id: 'video', label: 'Video Streaming', icon: <MonitorPlay /> },
    { id: 'audio', label: 'Audio & Music', icon: <Music /> },
    { id: 'internet', label: 'Internet', icon: <Wifi /> },
    { id: 'boxes', label: 'Delivery/Boxes', icon: <Box /> },
];

export default function LeakageModule() {
    const router = useRouter();

    const handleSave = (selectedIds: string[]) => {
        console.log("Leakages Identified:", selectedIds);
        // Move to next module or return to map
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen py-12 px-6">
            <MicroLearningWrapper
                moduleTitle="The Matka (Leakage Audit)"
                contextText="A clay pot (Matka) with a microscopic hole will empty itself by dawn. Subscriptions and automatic renewals are the modern invisible holes."
                insightText="The average person underestimates their monthly subscription costs by $133. This silent drain erodes the foundation of the Rajya."
                quizQuestion="What makes a 'leak' more dangerous than a 'purchase'?"
                quizOptions={[
                    { label: "It happens silently and automatically every moon cycle.", isCorrect: true },
                    { label: "It costs more than buying a house.", isCorrect: false },
                    { label: "It is visible on the daily ledger.", isCorrect: false }
                ]}
                onDataCaptureUnlock={() => console.log("Leakage Unlocked!")}
            >
                <SelectGridGame
                    label="Identify The Holes"
                    description="Which of these automatic drains are currently drawing from your Kosh?"
                    items={SUBSCRIPTIONS}
                    multiSelect={true}
                    onSave={handleSave}
                />
            </MicroLearningWrapper>

            {/* YouTube Tutorial */}
            <div className="mt-6">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">🎓 Learn More</p>
                <VideoTutorialPlaceholder youtubeId="PKisHOvFRow" label="Stop wasting money — hidden subscriptions & leakages" />
            </div>
        </div>
    );
}

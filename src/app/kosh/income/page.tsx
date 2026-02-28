"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { IncomeStore } from "@/lib/incomeStore";
import { ChaturangaBoard } from "@/components/treasury/ChaturangaBoard";
import { IncomeCard } from "@/components/treasury/IncomeCard";
import { PageGuide } from "@/components/ui/PageGuide";

export default function IncomeRegistryPage() {
    const router = useRouter();
    const records = IncomeStore.getRecords();
    const contributions = IncomeStore.getSourceContributions();
    const pieces = IncomeStore.getChaturangaPieces();
    const [tutorialDismissed, setTutorialDismissed] = useState(false);

    return (
        <div className="flex flex-col min-h-screen p-6 pb-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 pt-8 mb-6">
                    <button onClick={() => router.push("/kosh")} className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center">
                        <ArrowLeft className="w-4 h-4 text-white/60" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-white">Income Registry</h1>
                        <p className="text-xs text-white/50 mt-0.5">Manage and review all income sources.</p>
                    </div>
                </div>

                {/* Guide */}
                <PageGuide
                    title="Your Income Board"
                    description="Each income source is placed on the Chaturanga board. Your highest monthly source becomes the King. Add more sources to build a stronger, more resilient treasury."
                    actions={[{ emoji: "♚", label: "King = Primary" }, { emoji: "♟", label: "Pawns = Secondary" }]}
                />
                <div className="h-3" />

                {/* Tutorial strip (first time) */}
                {!tutorialDismissed && (
                    <div className="bg-[var(--color-rajya-accent)]/8 border border-[var(--color-rajya-accent)]/20 rounded-xl p-3 mb-4 flex items-center justify-between">
                        <p className="text-xs text-[var(--color-rajya-muted)] flex-1">
                            💡 A Rajya must not depend on one treasury stream. Add all recurring income sources to see your real monthly strength.
                        </p>
                        <button
                            onClick={() => setTutorialDismissed(true)}
                            className="text-xs text-[var(--color-rajya-accent)] font-medium shrink-0 ml-2"
                        >
                            Got it
                        </button>
                    </div>
                )}

                {/* Chaturanga Board */}
                <ChaturangaBoard pieces={pieces} />

                {/* Income List */}
                <div className="mt-5 space-y-2">
                    {records.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-[var(--color-rajya-muted)]">No income sources added yet.</p>
                        </div>
                    ) : (
                        records.map(record => {
                            const contrib = contributions.find(c => c.id === record.id);
                            return (
                                <IncomeCard
                                    key={record.id}
                                    record={record}
                                    contribution={contrib?.percentage}
                                />
                            );
                        })
                    )}
                </div>

                {/* Add CTA */}
                <button
                    onClick={() => router.push("/kosh/add")}
                    className="mt-5 w-full bg-[var(--color-rajya-accent)] text-black font-semibold py-4 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Income Source
                </button>
            </div>
        </div>
    );
}

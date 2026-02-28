"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, BarChart3, Calculator } from "lucide-react";
import { IncomeStore } from "@/lib/incomeStore";
import { TreasurySummaryCard } from "@/components/treasury/TreasurySummaryCard";
import { TreasuryMaturityBar } from "@/components/treasury/TreasuryMaturityBar";
import { PageGuide } from "@/components/ui/PageGuide";
import { VideoTutorialPlaceholder } from "@/components/ui/VideoTutorialPlaceholder";

export default function KoshHub() {
    const router = useRouter();
    const records = IncomeStore.getRecords();
    const monthlyNet = IncomeStore.getMonthlyNetIncome();
    const annualNet = IncomeStore.getAnnualNetIncome();
    const oneTimeTotal = IncomeStore.getOneTimeTotal();
    const strength = IncomeStore.getStrengthIndex();
    const depLevel = IncomeStore.getDependencyLevel();
    const maturity = IncomeStore.getMaturity();
    const insights = IncomeStore.getInsights();
    const dep = IncomeStore.getDependencyRatio();

    return (
        <div className="flex flex-col min-h-screen p-6 pb-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <div className="flex items-center gap-3 pt-8 mb-6">
                    <button onClick={() => router.push("/dashboard")} className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center">
                        <ArrowLeft className="w-4 h-4 text-white/60" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-white">Kosh (Treasury)</h1>
                        <p className="text-xs text-white/50 mt-0.5">Govern your income with clarity and structure.</p>
                    </div>
                </div>

                {/* Guide */}
                <PageGuide
                    title="What is Kosh?"
                    description="Map every income stream, detect dependency risk, and track your treasury's strength. This feeds all financial calculations downstream."
                    actions={[{ emoji: "💰", label: "Add income" }, { emoji: "📊", label: "Analytics" }, { emoji: "🧮", label: "Disposable" }]}
                />
                <div className="h-4" />

                {records.length === 0 ? (
                    /* Empty state */
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-rajya-accent)]/10 flex items-center justify-center mb-4">
                            <span className="text-3xl">♚</span>
                        </div>
                        <h2 className="text-lg font-semibold text-[var(--color-rajya-text)] mb-1">Your Treasury is empty</h2>
                        <p className="text-xs text-[var(--color-rajya-muted)] text-center mb-6 max-w-xs">
                            Add one income source to begin income governance.
                        </p>
                        <button
                            onClick={() => router.push("/kosh/add")}
                            className="bg-[var(--color-rajya-accent)] text-black font-semibold px-6 py-3 rounded-xl text-sm"
                        >
                            Add Income Source
                        </button>

                        {/* YouTube Tutorial */}
                        <div className="mt-6 w-full">
                            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">🎓 Learn More</p>
                            <VideoTutorialPlaceholder youtubeId="iWsQY6Ha4OE" label="Smart budgeting for Indians — income, expenses & savings" />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Summary Card */}
                        <TreasurySummaryCard
                            monthlyNet={monthlyNet}
                            annualNet={annualNet}
                            oneTimeTotal={oneTimeTotal}
                            strengthIndex={strength.overall}
                            dependencyLevel={depLevel}
                        />

                        {/* Dependency Alert */}
                        {dep.flag && (
                            <div className="mt-4 bg-[var(--color-rajya-danger)]/10 border border-[var(--color-rajya-danger)]/30 rounded-xl p-3 flex items-start gap-3">
                                <span className="text-lg">⚠</span>
                                <div>
                                    <p className="text-xs font-semibold text-[var(--color-rajya-danger)]">High Dependency Risk</p>
                                    <p className="text-[10px] text-[var(--color-rajya-muted)] mt-0.5">
                                        {dep.highSourceName} contributes {Math.round(dep.ratio * 100)}% of your income.
                                    </p>
                                    <button
                                        onClick={() => router.push("/kosh/analytics")}
                                        className="text-[10px] text-[var(--color-rajya-accent)] font-bold mt-1"
                                    >
                                        View Analytics →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Maturity */}
                        <div className="mt-4">
                            <TreasuryMaturityBar level={maturity.level} milestones={maturity.milestones} />
                        </div>

                        {/* Quick Insights */}
                        <div className="mt-4 bg-white/3 border border-white/8 rounded-xl p-3.5 space-y-1.5">
                            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Quick Insights</p>
                            {insights.map((insight, i) => (
                                <p key={i} className="text-xs text-white/50">• {insight}</p>
                            ))}
                        </div>

                        {/* Badges */}
                        {IncomeStore.getBadges().some(b => b.unlocked) && (
                            <div className="flex gap-2 mt-3 flex-wrap">
                                {IncomeStore.getBadges().filter(b => b.unlocked).map(b => (
                                    <span key={b.id} className="text-[10px] bg-[var(--color-rajya-accent)]/10 border border-[var(--color-rajya-accent)]/20 rounded-full px-2.5 py-1 text-[var(--color-rajya-accent)]/70">
                                        {b.emoji} {b.label}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* CTAs */}
                        <div className="mt-6 space-y-3">
                            <button
                                onClick={() => router.push("/kosh/add")}
                                className="w-full bg-[var(--color-rajya-accent)] text-black font-semibold py-4 rounded-xl text-sm flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Income Source
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => router.push("/kosh/income")}
                                    className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white/50 hover:border-white/25 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <span>📋</span> Income Registry
                                </button>
                                <button
                                    onClick={() => router.push("/kosh/analytics")}
                                    className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white/50 hover:border-white/25 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <BarChart3 className="w-3.5 h-3.5" /> Analytics
                                </button>
                            </div>
                            <button
                                onClick={() => router.push("/kosh/disposable")}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white/50 hover:border-white/25 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Calculator className="w-3.5 h-3.5" /> Estimate Disposable Income
                            </button>
                        </div>

                        {/* YouTube Tutorial */}
                        <div className="mt-4">
                            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">🎓 Learn More</p>
                            <VideoTutorialPlaceholder youtubeId="iWsQY6Ha4OE" label="Smart budgeting for Indians — income, expenses & savings" />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

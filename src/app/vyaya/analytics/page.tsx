"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Target, ShieldAlert, CreditCard } from "lucide-react";
import { ExpenseStore, formatRupee } from "@/lib/expenseStore";
import { IncomeStore } from "@/lib/incomeStore";
import { VideoTutorialPlaceholder } from "@/components/ui/VideoTutorialPlaceholder";

export default function AnalyticsPage() {
    const router = useRouter();
    const ratio = ExpenseStore.getExpenseToIncomeRatio();
    const hasIncome = IncomeStore.getMonthlyNetIncome() > 0;
    const breakdown = ExpenseStore.getCategoryBreakdown();
    const recurring = ExpenseStore.getRecurringVsOneTime();
    const discipline = ExpenseStore.getBudgetDisciplineScore();
    const leakage = ExpenseStore.getLeakageIndex();
    const dormantCount = ExpenseStore.getDormantSubscriptions().length;
    const adherence = ExpenseStore.getBudgetAdherence();

    const overspentCount = adherence.filter(a => a.status === "overspent").length;
    const nearLimitCount = adherence.filter(a => a.status === "near_limit").length;

    return (
        <div className="flex flex-col min-h-screen p-6 pb-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 pt-8 mb-4">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0">
                        <ArrowLeft className="w-4 h-4 text-white/60" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-white">Vyaya Analytics</h1>
                        <p className="text-xs text-white/35 mt-0.5">Where your money is going.</p>
                    </div>
                </div>

                <VideoTutorialPlaceholder youtubeId="iWsQY6Ha4OE" label="How to analyze expense patterns" />
                <div className="h-4" />

                {/* 1. Expense-to-Income Ratio */}
                <div className="bg-white/3 border border-white/8 rounded-xl p-4 mb-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Expense-to-Income Ratio</p>
                    {hasIncome && ratio ? (
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-white">{ratio.ratio}%</span>
                            <span className={`text-xs px-2.5 py-1 rounded-full ${ratio.color === "red" ? "bg-red-500/20 text-red-400" :
                                ratio.color === "amber" ? "bg-amber-400/20 text-amber-400" :
                                    "bg-emerald-500/20 text-emerald-400"}`}>
                                {ratio.label}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-white/50">—</span>
                            <button onClick={() => router.push("/kosh")} className="text-xs text-[var(--color-rajya-accent)] underline">
                                Add income in Kosh to view ratio
                            </button>
                        </div>
                    )}
                </div>

                {/* 2. Category Breakdown */}
                {breakdown.length > 0 && (
                    <div className="bg-white/3 border border-white/8 rounded-xl p-4 mb-4">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Category Breakdown</p>
                        <div className="space-y-3">
                            {breakdown.map(b => (
                                <div key={b.categoryId}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-white/70">{b.emoji} {b.name}</span>
                                        <span className="font-semibold text-white">{b.percentage}% <span className="text-white/30 font-normal">({formatRupee(b.amount)})</span></span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${b.percentage}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Recurring vs One-time */}
                {(recurring.recurringTotal > 0 || recurring.oneTimeTotal > 0) && (
                    <div className="bg-white/3 border border-white/8 rounded-xl p-4 mb-4">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Payment Pattern</p>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex mb-3">
                            <div className="h-full bg-[var(--color-rajya-accent)] transition-all" style={{ width: `${recurring.recurringPct}%` }} />
                            <div className="h-full bg-emerald-400 transition-all" style={{ width: `${recurring.oneTimePct}%` }} />
                        </div>
                        <div className="flex justify-between">
                            <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <div className="w-2 h-2 rounded-full bg-[var(--color-rajya-accent)]" />
                                    <p className="text-xs text-white/70">Recurring</p>
                                </div>
                                <p className="text-[10px] text-white/40">{recurring.recurringPct}% ({formatRupee(recurring.recurringTotal)})</p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-1.5 mb-0.5">
                                    <p className="text-xs text-white/70">One-time</p>
                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                </div>
                                <p className="text-[10px] text-white/40">{recurring.oneTimePct}% ({formatRupee(recurring.oneTimeTotal)})</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Scores row */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    {/* Budget Discipline */}
                    <div className="bg-white/3 border border-white/8 rounded-xl p-3">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Discipline Score</p>
                        <p className={`text-2xl font-bold mb-1 ${discipline >= 70 ? "text-emerald-400" : discipline >= 40 ? "text-amber-400" : "text-red-400"}`}>
                            {discipline}/100
                        </p>
                        {adherence.length > 0 ? (
                            <p className="text-[9px] text-white/40 leading-tight">
                                {nearLimitCount} categor{nearLimitCount === 1 ? "y" : "ies"} near limit, {overspentCount} overspent.
                            </p>
                        ) : (
                            <p className="text-[9px] text-white/40">No budgets set.</p>
                        )}
                    </div>

                    {/* Leakage Index */}
                    <div className="bg-white/3 border border-white/8 rounded-xl p-3">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Leakage Index</p>
                        <p className={`text-2xl font-bold mb-1 ${leakage <= 20 ? "text-emerald-400" : leakage <= 50 ? "text-amber-400" : "text-red-400"}`}>
                            {leakage}/100
                        </p>
                        <p className="text-[9px] text-white/40 leading-tight">
                            {dormantCount} dormant subscription{dormantCount === 1 ? "" : "s"} detected.
                            Higher index = more leaks.
                        </p>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="space-y-3 mb-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider px-1">Recommended Actions</p>

                    {adherence.length < 3 && (
                        <button onClick={() => router.push("/vyaya/categories")} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center shrink-0">
                                    <Target className="w-4 h-4 text-amber-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-medium text-white">Set budgets for top categories</p>
                                    <p className="text-[10px] text-white/40">You have {adherence.length} budget(s) set.</p>
                                </div>
                            </div>
                            <span className="text-white/20">→</span>
                        </button>
                    )}

                    {dormantCount > 0 && (
                        <button onClick={() => router.push("/vyaya/subscriptions")} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                    <ShieldAlert className="w-4 h-4 text-red-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-medium text-white">Review dormant subscriptions</p>
                                    <p className="text-[10px] text-white/40">Stop paying for what you don&apos;t use.</p>
                                </div>
                            </div>
                            <span className="text-white/20">→</span>
                        </button>
                    )}

                    <button onClick={() => router.push("/vyaya/categories")} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                <CreditCard className="w-4 h-4 text-white/60" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-medium text-white">Review spending categories</p>
                                <p className="text-[10px] text-white/40">Ensure your expenses are well classified.</p>
                            </div>
                        </div>
                        <span className="text-white/20">→</span>
                    </button>
                </div>

            </div>
        </div>
    );
}

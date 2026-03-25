"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ExpenseStore, formatRupee } from "@/lib/expenseStore";
import { VideoTutorialPlaceholder } from "@/components/ui/VideoTutorialPlaceholder";

export default function BudgetPage() {
    const router = useRouter();
    const [categories, setCategories] = useState(ExpenseStore.getActiveCategories());
    const [globalThreshold, setGlobalThreshold] = useState(80);
    const [saved, setSaved] = useState(false);

    const adherence = ExpenseStore.getBudgetAdherence();
    const totalBudget = categories.reduce((s, c) => s + c.budgetAmount, 0);
    const totalSpent = ExpenseStore.getMonthlyTotal();
    const overallAdherence = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const disciplineScore = ExpenseStore.getBudgetDisciplineScore();

    const handleBudgetChange = (id: string, val: string) => {
        const num = parseFloat(val) || 0;
        ExpenseStore.setCategoryBudget(id, num);
        setCategories(ExpenseStore.getActiveCategories());
    };

    const handleThresholdChange = (val: string) => {
        const num = Math.min(100, Math.max(0, parseInt(val) || 80));
        setGlobalThreshold(num);
        for (const c of categories) {
            ExpenseStore.setCategoryThreshold(c.id, num / 100);
        }
    };

    const overspent = adherence.filter(a => a.status === "overspent");

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
                        <h1 className="text-lg font-semibold text-white">Category Budgets</h1>
                        <p className="text-xs text-white/35 mt-0.5">Set limits and get early warnings.</p>
                    </div>
                </div>

                {/* Tutorial strip */}
                <div className="bg-[var(--color-rajya-accent)]/8 border border-[var(--color-rajya-accent)]/20 rounded-xl p-3 mb-3">
                    <p className="text-xs text-[var(--color-rajya-muted)]">💡 <strong className="text-[var(--color-rajya-text)]">Discipline is planned</strong>, not reactive.</p>
                </div>
                <VideoTutorialPlaceholder youtubeId="iWsQY6Ha4OE" label="Budgeting basics for Indian households" />
                <div className="h-4" />

                {saved && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 mb-4">
                        <span className="text-xs text-emerald-400">✓ Budgets saved.</span>
                    </div>
                )}

                {/* Summary strip */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="bg-white/3 border border-white/8 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-white/30">Total Budget</p>
                        <p className="text-sm font-bold text-white/70">{totalBudget > 0 ? formatRupee(totalBudget) : "—"}</p>
                    </div>
                    <div className="bg-white/3 border border-white/8 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-white/30">Actual Spend</p>
                        <p className="text-sm font-bold text-white/70">{formatRupee(totalSpent)}</p>
                    </div>
                    <div className="bg-white/3 border border-white/8 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-white/30">Adherence</p>
                        <p className={`text-sm font-bold ${overallAdherence > 100 ? "text-red-400" : overallAdherence > 80 ? "text-amber-400" : "text-emerald-400"}`}>
                            {totalBudget > 0 ? `${overallAdherence}%` : "—"}
                        </p>
                    </div>
                </div>

                {/* Global alert threshold */}
                <div className="bg-white/3 border border-white/8 rounded-xl p-3 mb-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-white/50">Alert threshold</p>
                        <p className="text-[10px] text-white/30">Warn me when spending reaches this %</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <input type="number" value={globalThreshold} min={50} max={100}
                            onChange={e => handleThresholdChange(e.target.value)}
                            className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white text-center focus:outline-none" />
                        <span className="text-xs text-white/30">%</span>
                    </div>
                </div>

                {/* Overspend callout */}
                {overspent.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                        {overspent.map(o => (
                            <div key={o.categoryId} className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5">
                                <p className="text-xs text-red-400">⚠ {o.emoji} {o.name} overspent by {formatRupee(o.spent - o.budget)}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Category budget list */}
                <div className="space-y-2 mb-5">
                    {categories.map(cat => {
                        const adh = adherence.find(a => a.categoryId === cat.id);
                        const spent = adh?.spent || 0;
                        const pct = adh?.adherencePct || 0;
                        const status = adh?.status;

                        return (
                            <div key={cat.id} className="bg-white/3 border border-white/8 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-white">{cat.emoji} {cat.name}</span>
                                    {status && (
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${status === "safe" ? "bg-emerald-500/15 text-emerald-400" :
                                            status === "near_limit" ? "bg-amber-400/15 text-amber-400" :
                                                "bg-red-500/15 text-red-400"}`}>
                                            {status === "safe" ? "Safe" : status === "near_limit" ? "Near Limit" : "Overspent"}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <label className="text-[10px] text-white/30">Monthly Budget</label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white/30">₹</span>
                                            <input type="number" value={cat.budgetAmount || ""} placeholder="—"
                                                onChange={e => handleBudgetChange(cat.id, e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-5 pr-2 py-1.5 text-xs text-white focus:outline-none" />
                                        </div>
                                    </div>
                                    <div className="text-right w-20">
                                        <p className="text-[10px] text-white/30">Spent</p>
                                        <p className="text-xs text-white/50">{formatRupee(spent)}</p>
                                    </div>
                                </div>
                                {cat.budgetAmount > 0 && (
                                    <div className="mt-2">
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all ${pct > 100 ? "bg-red-400" : pct > 80 ? "bg-amber-400" : "bg-emerald-400"}`}
                                                style={{ width: `${Math.min(pct, 100)}%` }} />
                                        </div>
                                        <p className="text-[10px] text-white/20 mt-0.5 text-right">{pct}%</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Discipline score */}
                {adherence.length > 0 && (
                    <div className="bg-white/3 border border-white/8 rounded-xl p-3 mb-5 flex items-center justify-between">
                        <span className="text-xs text-white/40">Budget Discipline Score</span>
                        <span className={`text-sm font-bold ${disciplineScore >= 70 ? "text-emerald-400" : disciplineScore >= 40 ? "text-amber-400" : "text-red-400"}`}>
                            {disciplineScore}/100
                        </span>
                    </div>
                )}

                {/* Save */}
                <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
                    className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm hover:bg-amber-300 transition-colors">
                    Save Budgets
                </button>
            </div>
        </div>
    );
}

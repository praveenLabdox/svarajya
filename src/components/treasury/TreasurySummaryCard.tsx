"use client";

import { formatRupee } from "@/lib/incomeStore";
import { DependencyBadge } from "./DependencyBadge";

interface TreasurySummaryCardProps {
    monthlyNet: number;
    annualNet: number;
    oneTimeTotal: number;
    strengthIndex: number;
    dependencyLevel: "low" | "medium" | "high";
}

export function TreasurySummaryCard({ monthlyNet, annualNet, oneTimeTotal, strengthIndex, dependencyLevel }: TreasurySummaryCardProps) {
    const getStrengthLabel = (s: number) => {
        if (s >= 80) return "Strong";
        if (s >= 60) return "Stable";
        if (s >= 40) return "Moderate";
        return "Weak";
    };

    const getStrengthColor = (s: number) => {
        if (s >= 70) return "text-[var(--color-rajya-success)]";
        if (s >= 40) return "text-[var(--color-rajya-accent)]";
        return "text-[var(--color-rajya-danger)]";
    };

    return (
        <div className="bg-[var(--color-rajya-card)] border border-[var(--color-rajya-accent-dim)] rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--color-rajya-accent)]/10 blur-3xl rounded-full" />

            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-[var(--color-rajya-text)] font-medium text-sm">Monthly Net Income</h2>
                    <p className="text-2xl font-bold text-[var(--color-rajya-text)] mt-1">{formatRupee(monthlyNet)}</p>
                </div>
                <DependencyBadge level={dependencyLevel} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-[10px] text-[var(--color-rajya-muted)] uppercase tracking-wider">Annual Net</p>
                    <p className="text-sm font-semibold text-[var(--color-rajya-text)] mt-0.5">{formatRupee(annualNet)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-[10px] text-[var(--color-rajya-muted)] uppercase tracking-wider">One-Time</p>
                    <p className="text-sm font-semibold text-[var(--color-rajya-text)] mt-0.5">{formatRupee(oneTimeTotal)}</p>
                </div>
            </div>

            {/* Strength Index */}
            <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                    <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
                        <circle
                            cx="18" cy="18" r="15" fill="none"
                            stroke="currentColor" strokeWidth="3"
                            strokeDasharray={`${strengthIndex * 0.94} 100`}
                            strokeLinecap="round"
                            className={getStrengthColor(strengthIndex)}
                        />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${getStrengthColor(strengthIndex)}`}>
                        {strengthIndex}
                    </span>
                </div>
                <div>
                    <p className="text-xs text-[var(--color-rajya-muted)]">Income Strength Index</p>
                    <p className={`text-sm font-semibold ${getStrengthColor(strengthIndex)}`}>{getStrengthLabel(strengthIndex)}</p>
                </div>
            </div>
        </div>
    );
}

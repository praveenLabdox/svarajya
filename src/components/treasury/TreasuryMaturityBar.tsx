"use client";

import { TreasuryMilestone } from "@/lib/incomeStore";

interface TreasuryMaturityBarProps {
    level: number;
    milestones: TreasuryMilestone[];
}

export function TreasuryMaturityBar({ level, milestones }: TreasuryMaturityBarProps) {
    return (
        <div className="bg-[var(--color-rajya-card)] border border-[var(--color-rajya-accent)]/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-[var(--color-rajya-text)]">Treasury Maturity</p>
                <span className="text-xs font-bold text-[var(--color-rajya-accent)]">{level} / 4</span>
            </div>
            <div className="h-2 bg-[var(--color-rajya-muted)]/20 rounded-full overflow-hidden mb-3">
                <div
                    className="h-full bg-gradient-to-r from-[var(--color-rajya-accent-dim)] to-[var(--color-rajya-accent)] rounded-full transition-all duration-700"
                    style={{ width: `${(level / 4) * 100}%` }}
                />
            </div>
            <div className="grid grid-cols-4 gap-1">
                {milestones.map((m, i) => (
                    <div key={m.id} className="text-center">
                        <div className={`w-5 h-5 rounded-full mx-auto mb-1 flex items-center justify-center text-[10px] ${m.unlocked
                                ? "bg-[var(--color-rajya-accent)] text-black"
                                : "bg-[var(--color-rajya-muted)]/20 text-[var(--color-rajya-muted)]"
                            }`}>
                            {m.unlocked ? "✓" : i + 1}
                        </div>
                        <p className={`text-[9px] leading-tight ${m.unlocked ? "text-[var(--color-rajya-accent)]" : "text-[var(--color-rajya-muted)]"}`}>
                            {m.label.replace("Treasury ", "")}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

"use client";

import { IncomeType, INCOME_TYPES } from "@/lib/incomeStore";

interface IncomeTypeChipsProps {
    selected: IncomeType | null;
    onSelect: (type: IncomeType) => void;
    error?: string;
}

export function IncomeTypeChips({ selected, onSelect, error }: IncomeTypeChipsProps) {
    return (
        <div>
            <label className="text-xs text-[var(--color-rajya-muted)] mb-2 block">Income Type</label>
            <div className="flex flex-wrap gap-2">
                {INCOME_TYPES.map(t => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => onSelect(t.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selected === t.id
                                ? "bg-[var(--color-rajya-accent)] text-black border-[var(--color-rajya-accent)]"
                                : "bg-white/5 border-white/10 text-[var(--color-rajya-text)] hover:border-[var(--color-rajya-accent)]/40"
                            }`}
                    >
                        {t.emoji} {t.label}
                    </button>
                ))}
            </div>
            {error && <p className="text-[10px] text-[var(--color-rajya-danger)] mt-1">⚠ {error}</p>}
        </div>
    );
}

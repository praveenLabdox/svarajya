"use client";

import { Info } from "lucide-react";

interface PageGuideProps {
    title: string;
    description: string;
    actions?: { emoji: string; label: string }[];
}

/**
 * Reusable guide section for page-level context.
 * Renders a highlighted info box with title, description,
 * and optional action chips.
 */
export function PageGuide({ title, description, actions }: PageGuideProps) {
    return (
        <div className="bg-[var(--color-rajya-card)] border border-[var(--color-rajya-accent)]/20 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-[var(--color-rajya-accent)] shrink-0 mt-0.5" />
            <div>
                <p className="text-sm font-medium text-[var(--color-rajya-text)]">{title}</p>
                <p className="text-xs text-[var(--color-rajya-muted)] leading-relaxed mt-1">{description}</p>
                {actions && actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2.5">
                        {actions.map((a, i) => (
                            <span key={i} className="text-[10px] bg-[var(--color-rajya-bg)] border border-[var(--color-rajya-muted)]/20 rounded-full px-2.5 py-1 text-[var(--color-rajya-muted)]">
                                {a.emoji} {a.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

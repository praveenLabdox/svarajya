"use client";

interface DependencyBadgeProps {
    level: "low" | "medium" | "high";
}

const CONFIG = {
    low: { label: "Low", bg: "bg-emerald-600", text: "text-white" },
    medium: { label: "Medium", bg: "bg-amber-600", text: "text-white" },
    high: { label: "High", bg: "bg-red-600", text: "text-white" },
};

export function DependencyBadge({ level }: DependencyBadgeProps) {
    const c = CONFIG[level];
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
            {c.label}
        </span>
    );
}

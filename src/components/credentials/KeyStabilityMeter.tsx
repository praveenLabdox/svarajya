"use client";

interface KeyStabilityMeterProps {
    score: number;
    label?: string;
}

export function KeyStabilityMeter({ score, label = "Credential Health" }: KeyStabilityMeterProps) {
    const color = score >= 70 ? "bg-emerald-400" : score >= 40 ? "bg-amber-400" : "bg-red-400";
    const textColor = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400";
    const status = score >= 70 ? "Stable" : score >= 40 ? "Needs Attention" : "At Risk";

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/40">{label}</span>
                <span className={`text-sm font-semibold ${textColor}`}>{score}% {status}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${score}%` }} />
            </div>
            <p className="text-[10px] text-white/20 mt-2">Improve portal details to increase stability.</p>
        </div>
    );
}

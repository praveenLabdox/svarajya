import { useState } from "react";
import { Coins, Save } from "lucide-react";

interface NumberInputGameProps {
    label: string;
    description: string;
    currency?: boolean;
    onSave: (val: number) => void;
}

export function NumberInputGame({ label, description, currency = true, onSave }: NumberInputGameProps) {
    const [value, setValue] = useState("");

    const handleConfirm = () => {
        if (value) onSave(Number(value));
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h3 className="text-xl text-[var(--color-rajya-accent)]">{label}</h3>
                <p className="text-sm text-[var(--color-rajya-muted)]">{description}</p>
            </div>

            <div className="relative flex justify-center">
                <div className="absolute inset-0 flex justify-center items-center opacity-10 blur-xl">
                    <div className="w-32 h-32 bg-[var(--color-rajya-accent)] rounded-full" />
                </div>

                <div className="relative bg-[var(--color-rajya-card)] border border-[var(--color-rajya-accent-dim)] rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-6 w-full max-w-xs">
                    {currency && <Coins className="w-12 h-12 text-[var(--color-rajya-accent)]" />}

                    <div className="w-full relative">
                        {currency && (
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-rajya-muted)] text-xl">
                                ₹
                            </span>
                        )}
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="0"
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-4 text-center text-3xl font-display tracking-widest text-[var(--color-rajya-text)] focus:outline-none focus:border-[var(--color-rajya-accent)] transition-colors"
                        />
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={!value}
                        className="w-full flex items-center justify-center gap-2 bg-[var(--color-rajya-accent)]/10 text-[var(--color-rajya-accent)] py-3 rounded-xl border border-[var(--color-rajya-accent)]/50 hover:bg-[var(--color-rajya-accent)]/30 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        Seal Amount
                    </button>
                </div>
            </div>
        </div>
    );
}

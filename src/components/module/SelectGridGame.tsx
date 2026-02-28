import { useState } from "react";
import { Check, Settings2 } from "lucide-react";

interface GridItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface SelectGridGameProps {
    label: string;
    description: string;
    items: GridItem[];
    multiSelect?: boolean;
    onSave: (selectedIds: string[]) => void;
}

export function SelectGridGame({
    label,
    description,
    items,
    multiSelect = true,
    onSave
}: SelectGridGameProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const toggleItem = (id: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            if (!multiSelect) newSelected.clear();
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h3 className="text-xl text-[var(--color-rajya-accent)] flex items-center justify-center gap-2">
                    <Settings2 className="w-5 h-5" />
                    {label}
                </h3>
                <p className="text-sm text-[var(--color-rajya-muted)]">{description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {items.map((item) => {
                    const isSelected = selected.has(item.id);
                    return (
                        <button
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all duration-300 ${isSelected
                                    ? "bg-[var(--color-rajya-accent)]/20 border-[var(--color-rajya-accent)] text-[var(--color-rajya-accent)] shadow-[0_0_15px_rgba(251,191,36,0.15)] scale-105"
                                    : "bg-[var(--color-rajya-card)] border-white/10 text-[var(--color-rajya-text)] hover:border-white/30"
                                }`}
                        >
                            <div className={`p-3 rounded-full ${isSelected ? 'bg-[var(--color-rajya-accent)]/20' : 'bg-white/5'}`}>
                                {item.icon || <div className="w-6 h-6 rounded-full bg-current opacity-50" />}
                            </div>
                            <span className="text-sm font-medium tracking-wide">{item.label}</span>
                            {isSelected && (
                                <div className="absolute top-2 right-2">
                                    <Check className="w-4 h-4" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={() => onSave(Array.from(selected))}
                    disabled={selected.size === 0}
                    className="w-full max-w-xs flex items-center justify-center gap-2 bg-[var(--color-rajya-card)] text-[var(--color-rajya-text)] py-4 rounded-xl border border-[var(--color-rajya-accent-dim)] hover:border-[var(--color-rajya-accent)] transition-colors disabled:opacity-50"
                >
                    <span className="font-display tracking-widest uppercase text-sm">Seal Selection</span>
                </button>
            </div>
        </div>
    );
}

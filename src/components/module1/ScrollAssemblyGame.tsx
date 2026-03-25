import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldAlert, GraduationCap, Building2, Calendar, BookOpen, AlertCircle } from "lucide-react";

export type EducationTile = {
    id: string;
    type: "degree" | "institution" | "year" | "specialization";
    label: string;
    icon: React.ReactNode;
    value: string;
};

interface ScrollAssemblyProps {
    onComplete: (data: { degree: string; institution: string; year: string; specialization: string; hasLoan: boolean }) => void;
}

const TILE_TYPES = [
    { id: "degree", label: "Highest Degree", icon: <GraduationCap className="w-5 h-5 text-[var(--color-rajya-accent)]" /> },
    { id: "specialization", label: "Field of Study", icon: <BookOpen className="w-5 h-5 text-[var(--color-rajya-accent)]" /> },
    { id: "institution", label: "Gurukul (Institution)", icon: <Building2 className="w-5 h-5 text-[var(--color-rajya-accent)]" /> },
    { id: "year", label: "Year of Mastery", icon: <Calendar className="w-5 h-5 text-[var(--color-rajya-accent)]" /> },
];

export function ScrollAssemblyGame({ onComplete }: ScrollAssemblyProps) {
    const [activeTileIndex, setActiveTileIndex] = useState(0);
    const [assembledTiles, setAssembledTiles] = useState<EducationTile[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [hasLoan, setHasLoan] = useState<boolean | null>(null);

    const currentType = TILE_TYPES[activeTileIndex];
    const isComplete = activeTileIndex >= TILE_TYPES.length;

    const handleDragSubmit = () => {
        if (!inputValue) return;

        const newTile: EducationTile = {
            id: Math.random().toString(),
            type: currentType.id as EducationTile["type"],
            label: currentType.label,
            icon: currentType.icon,
            value: inputValue
        };

        setAssembledTiles([...assembledTiles, newTile]);
        setInputValue("");
        setActiveTileIndex(prev => prev + 1);
    };

    const handleFinalSeal = () => {
        if (hasLoan === null) return;

        // Transform array state to exactly what parent needs
        const data = {
            degree: assembledTiles.find(t => t.type === 'degree')?.value || "",
            institution: assembledTiles.find(t => t.type === 'institution')?.value || "",
            year: assembledTiles.find(t => t.type === 'year')?.value || "",
            specialization: assembledTiles.find(t => t.type === 'specialization')?.value || "",
            hasLoan: hasLoan
        };
        onComplete(data);
    };

    return (
        <div className="w-full flex flex-col items-center">

            {/* Visual Scroll Area (The assembly zone) */}
            <div className="w-full max-w-sm min-h-[300px] bg-[#fdf6e3]/5 border-x-4 border-y-2 border-[#b45309]/30 rounded-lg relative overflow-hidden p-6 mb-8 flex flex-col gap-3 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">

                {/* Scroll End Caps (Styling) */}
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-[#b45309]/50 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-[#b45309]/50 to-transparent" />

                <div className="text-center mb-4">
                    <h3 className="font-display text-[var(--color-rajya-accent)] tracking-widest text-sm uppercase">Parchment of Wisdom</h3>
                </div>

                <AnimatePresence>
                    {assembledTiles.map((tile) => (
                        <motion.div
                            key={tile.id}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="bg-[var(--color-rajya-bg)]/80 border border-[var(--color-rajya-accent-dim)] rounded-md p-3 flex items-center gap-4 relative isolate overflow-hidden"
                        >
                            <div className="p-2 bg-black/40 rounded shadow-inner z-10">{tile.icon}</div>
                            <div className="z-10 flex-1">
                                <p className="text-[10px] uppercase text-[var(--color-rajya-muted)] tracking-wider">{tile.label}</p>
                                <p className="text-[var(--color-rajya-text)] font-semibold">{tile.value}</p>
                            </div>
                            <div className="absolute top-2 right-3 text-[var(--color-rajya-success)] z-10"><Check className="w-4 h-4" /></div>
                            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[var(--color-rajya-accent)]/5 to-transparent z-0" />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {assembledTiles.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--color-rajya-muted)] opacity-50 italic text-sm">
                        Drag the tiles of your history here...
                    </div>
                )}
            </div>

            {/* Input / Control Panel */}
            <div className="w-full bg-[var(--color-rajya-card)] rounded-2xl p-6 border border-white/10 shadow-xl">
                {!isComplete ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentType.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3 justify-center mb-6 text-[var(--color-rajya-text)]">
                                {currentType.icon}
                                <span className="font-medium text-lg">Define {currentType.label}</span>
                            </div>

                            <input
                                type={currentType.id === 'year' ? 'number' : 'text'}
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                placeholder={`Enter ${currentType.label.toLowerCase()}...`}
                                className="w-full bg-black/50 border border-[var(--color-rajya-accent)]/50 rounded-xl px-4 py-4 text-center text-[var(--color-rajya-text)] focus:outline-none focus:border-[var(--color-rajya-accent)] transition-all shadow-[0_0_15px_rgba(251,191,36,0.1)] focus:shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                            />

                            <button
                                onClick={handleDragSubmit}
                                disabled={!inputValue}
                                className="w-full py-4 rounded-xl bg-[var(--color-rajya-accent)]/20 text-[var(--color-rajya-accent)] font-bold tracking-widest uppercase text-sm border border-[var(--color-rajya-accent)] transition-colors hover:bg-[var(--color-rajya-accent)] hover:text-black disabled:opacity-50"
                            >
                                Stamp onto Scroll
                            </button>
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="text-center border-b border-white/10 pb-4">
                            <h4 className="text-[var(--color-rajya-text)] font-medium flex items-center justify-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-[var(--color-rajya-accent)]" />
                                Gurukul Debt Verification
                            </h4>
                            <p className="text-xs text-[var(--color-rajya-muted)]">Did the kingdom borrow gold to fund this mastery?</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <button
                                onClick={() => setHasLoan(true)}
                                className={`py-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${hasLoan === true ? 'bg-[var(--color-rajya-danger)]/20 border-[var(--color-rajya-danger)] text-[var(--color-rajya-danger)] scale-105' : 'bg-black/20 border-white/10 hover:border-white/30 text-[var(--color-rajya-muted)]'}`}
                            >
                                <ShieldAlert className="w-6 h-6" /> Yes, Education Loan
                            </button>
                            <button
                                onClick={() => setHasLoan(false)}
                                className={`py-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${hasLoan === false ? 'bg-[var(--color-rajya-success)]/20 border-[var(--color-rajya-success)] text-[var(--color-rajya-success)] scale-105' : 'bg-black/20 border-white/10 hover:border-white/30 text-[var(--color-rajya-muted)]'}`}
                            >
                                <Check className="w-6 h-6" /> No Loan Active
                            </button>
                        </div>

                        <button
                            onClick={handleFinalSeal}
                            disabled={hasLoan === null}
                            className="w-full py-4 rounded-xl bg-[var(--color-rajya-accent)] text-black font-display tracking-widest uppercase text-sm font-bold mt-4 hover:bg-[var(--color-rajya-accent)]/90 transition-colors disabled:opacity-50"
                        >
                            Seal The Scroll
                        </button>
                    </motion.div>
                )}
            </div>

        </div>
    );
}

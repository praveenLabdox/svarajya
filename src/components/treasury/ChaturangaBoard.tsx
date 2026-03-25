"use client";

import { formatRupee, IncomeType, INCOME_TYPES } from "@/lib/incomeStore";

interface ChaturangaPiece {
    piece: "king" | "rook" | "knight" | "pawn";
    sourceName: string;
    monthlyNet: number;
    incomeType: IncomeType;
}

interface ChaturangaBoardProps {
    pieces: ChaturangaPiece[];
}

const PIECE_ICONS: Record<string, string> = {
    king: "♚",
    rook: "♜",
    knight: "♞",
    pawn: "♟",
};

const PIECE_LABELS: Record<string, string> = {
    king: "Primary",
    rook: "Major",
    knight: "Secondary",
    pawn: "Minor",
};

export function ChaturangaBoard({ pieces }: ChaturangaBoardProps) {
    if (pieces.length === 0) {
        return (
            <div className="bg-[var(--color-rajya-card)] border border-white/10 rounded-xl p-5 text-center">
                <p className="text-3xl mb-2">♚</p>
                <p className="text-sm text-[var(--color-rajya-muted)]">No income sources yet</p>
                <p className="text-xs text-[var(--color-rajya-muted)]/60 mt-1">Add your first source to place the King</p>
            </div>
        );
    }

    return (
        <div className="bg-[var(--color-rajya-card)] border border-[var(--color-rajya-accent)]/20 rounded-xl p-4">
            <p className="text-xs text-[var(--color-rajya-muted)] uppercase tracking-wider mb-3">Income Structure</p>

            {/* Chess board grid */}
            <div className="bg-white/3 border border-white/8 rounded-lg p-3 mb-3">
                <div className="flex flex-wrap gap-3 justify-center">
                    {pieces.map((p, i) => {
                        const typeMeta = INCOME_TYPES.find(t => t.id === p.incomeType);
                        return (
                            <div
                                key={i}
                                className={`flex flex-col items-center p-3 rounded-lg transition-all ${p.piece === "king"
                                    ? "bg-[var(--color-rajya-accent)]/15 border border-[var(--color-rajya-accent)]/30"
                                    : "bg-white/5 border border-white/8"
                                    }`}
                                style={{ minWidth: "80px" }}
                            >
                                <span className={`text-2xl mb-1 ${p.piece === "king" ? "text-[var(--color-rajya-accent)]" : "text-[var(--color-rajya-text)]"}`}>
                                    {PIECE_ICONS[p.piece]}
                                </span>
                                <p className="text-[10px] font-bold text-[var(--color-rajya-text)] text-center truncate max-w-[70px]">
                                    {typeMeta?.emoji} {p.sourceName}
                                </p>
                                <p className="text-[9px] text-[var(--color-rajya-muted)]">{formatRupee(p.monthlyNet)}/mo</p>
                                <span className={`text-[8px] uppercase tracking-wider mt-1 font-bold ${p.piece === "king" ? "text-[var(--color-rajya-accent)]" : "text-[var(--color-rajya-muted)]"
                                    }`}>
                                    {PIECE_LABELS[p.piece]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-[9px] text-[var(--color-rajya-muted)]">
                <span>♚ King = Primary income</span>
                <span>♟ Pawns = Secondary streams</span>
            </div>
            <p className="text-[9px] text-[var(--color-rajya-muted)]/60 mt-1">
                Your highest monthly source automatically becomes King.
            </p>
        </div>
    );
}

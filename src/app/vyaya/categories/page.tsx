"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import { ExpenseStore, formatRupee } from "@/lib/expenseStore";
import { VideoTutorialPlaceholder } from "@/components/ui/VideoTutorialPlaceholder";

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState(ExpenseStore.getCategories());
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState("");
    const [newEmoji, setNewEmoji] = useState("📌");
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);

    const breakdown = ExpenseStore.getCategoryBreakdown();
    const getSpent = (catId: string) => breakdown.find(b => b.categoryId === catId)?.amount || 0;

    const handleToggle = (id: string) => {
        ExpenseStore.toggleCategory(id);
        setCategories(ExpenseStore.getCategories());
    };

    const handleBudgetChange = (id: string, val: string) => {
        const num = parseFloat(val) || 0;
        ExpenseStore.setCategoryBudget(id, num);
        setCategories(ExpenseStore.getCategories());
    };

    const handleAddCustom = () => {
        if (!newName.trim()) { setError("Category name is required."); return; }
        if (categories.some(c => c.name.toLowerCase() === newName.trim().toLowerCase())) {
            setError("Category name already exists."); return;
        }
        ExpenseStore.addCustomCategory(newName.trim(), newEmoji || "📌");
        setCategories(ExpenseStore.getCategories());
        setNewName("");
        setNewEmoji("📌");
        setShowAdd(false);
        setError("");
    };

    const handleDeleteCustom = (id: string) => {
        ExpenseStore.deleteCustomCategory(id);
        setCategories(ExpenseStore.getCategories());
    };

    const incomeExists = ExpenseStore.getEntryCount() === 0 && categories.every(c => c.budgetAmount === 0);

    return (
        <div className="flex flex-col min-h-screen p-6 pb-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 pt-8 mb-4">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0">
                        <ArrowLeft className="w-4 h-4 text-white/60" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-white">Expense Categories</h1>
                        <p className="text-xs text-white/35 mt-0.5">Turn categories on/off and set optional budgets.</p>
                    </div>
                </div>

                {/* Tutorial strip */}
                <div className="bg-[var(--color-rajya-accent)]/8 border border-[var(--color-rajya-accent)]/20 rounded-xl p-3 mb-3">
                    <p className="text-xs text-[var(--color-rajya-muted)]">💡 <strong className="text-[var(--color-rajya-text)]">Money doesn&apos;t leak in one big hole.</strong> It leaks in small drains.</p>
                </div>
                <VideoTutorialPlaceholder youtubeId="iWsQY6Ha4OE" label="Expense categorization basics" />
                <div className="h-4" />

                {/* Income + categories warning */}
                {incomeExists && (
                    <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-2.5 mb-4">
                        <p className="text-xs text-amber-400">⚠ Without expense mapping, Treasury visibility is partial.</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 mb-4">
                        <span className="text-xs text-red-400">⚠ {error}</span>
                    </div>
                )}

                {saved && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 mb-4">
                        <span className="text-xs text-emerald-400">✓ Categories saved.</span>
                    </div>
                )}

                {/* Category grid */}
                <div className="space-y-2 mb-5">
                    {categories.map(cat => {
                        const spent = getSpent(cat.id);
                        return (
                            <div key={cat.id} className={`bg-white/3 border rounded-xl p-3 ${cat.active ? "border-white/10" : "border-white/5 opacity-50"}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{cat.emoji}</span>
                                        <span className="text-sm text-white">{cat.name}</span>
                                        {cat.isCustom && (
                                            <button onClick={() => handleDeleteCustom(cat.id)} className="text-white/20 hover:text-red-400">
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <button onClick={() => handleToggle(cat.id)}
                                        className={`w-10 h-6 rounded-full border transition-colors flex items-center px-0.5 ${cat.active ? "bg-emerald-500 border-emerald-500" : "bg-white/10 border-white/20"}`}>
                                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${cat.active ? "translate-x-4" : "translate-x-0"}`} />
                                    </button>
                                </div>
                                {cat.active && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-white/30">Budget (optional)</label>
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white/30">₹</span>
                                                <input type="number" value={cat.budgetAmount || ""} placeholder="—"
                                                    onChange={e => handleBudgetChange(cat.id, e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-5 pr-2 py-1.5 text-xs text-white focus:outline-none" />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-white/30">This month</p>
                                            <p className="text-xs text-white/50">{spent > 0 ? formatRupee(spent) : "₹—"}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Add Custom Category */}
                {!showAdd ? (
                    <button onClick={() => setShowAdd(true)}
                        className="w-full bg-white/5 border border-dashed border-white/15 rounded-xl py-3 text-xs text-white/40 flex items-center justify-center gap-2 mb-5">
                        <Plus className="w-3.5 h-3.5" /> Add Custom Category
                    </button>
                ) : (
                    <div className="bg-white/5 border border-white/15 rounded-xl p-3 mb-5 space-y-3">
                        <div className="flex gap-2">
                            <input type="text" value={newEmoji} maxLength={2}
                                onChange={e => setNewEmoji(e.target.value)}
                                className="w-12 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-center text-lg focus:outline-none" />
                            <input type="text" placeholder="Category name" value={newName}
                                onChange={e => { setNewName(e.target.value); setError(""); }}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none" />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleAddCustom}
                                className="flex-1 bg-amber-400 text-black font-semibold py-2 rounded-lg text-xs">Create</button>
                            <button onClick={() => { setShowAdd(false); setError(""); }}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/40">Cancel</button>
                        </div>
                    </div>
                )}

                {/* Save */}
                <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
                    className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm hover:bg-amber-300 transition-colors">
                    Save Changes
                </button>
            </div>
        </div>
    );
}

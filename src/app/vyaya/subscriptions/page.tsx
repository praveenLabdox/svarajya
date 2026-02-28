"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, AlertCircle } from "lucide-react";
import { ExpenseStore, formatRupee } from "@/lib/expenseStore";
import { VideoTutorialPlaceholder } from "@/components/ui/VideoTutorialPlaceholder";

export default function SubscriptionsPage() {
    const router = useRouter();
    const [showAdd, setShowAdd] = useState(false);
    const [subs, setSubs] = useState(ExpenseStore.getSubscriptions());
    const dormant = ExpenseStore.getDormantSubscriptions();
    const monthlyTotal = ExpenseStore.getMonthlySubscriptionTotal();
    const annualLeakage = ExpenseStore.getAnnualLeakageEstimate();

    // Add form state
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("subscriptions");
    const [amount, setAmount] = useState("");
    const [renewalDate, setRenewalDate] = useState("");
    const [autoDebitBank, setAutoDebitBank] = useState("");
    const [lastUsedDate, setLastUsedDate] = useState("");
    const [error, setError] = useState("");

    const categories = ExpenseStore.getActiveCategories();

    const handleSave = () => {
        if (!name.trim()) { setError("Subscription name is required."); return; }
        const amt = parseFloat(amount);
        if (!amt || amt <= 0) { setError("Amount must be greater than 0."); return; }
        setError("");

        ExpenseStore.addSubscription({
            name: name.trim(),
            categoryId,
            amount: amt,
            renewalDate: renewalDate || undefined,
            autoDebitBank: autoDebitBank.trim() || undefined,
            lastUsedDate: lastUsedDate || undefined,
        });
        setSubs(ExpenseStore.getSubscriptions());
        setName(""); setAmount(""); setRenewalDate(""); setAutoDebitBank(""); setLastUsedDate("");
        setShowAdd(false);
    };

    const handleDelete = (id: string) => {
        ExpenseStore.deleteSubscription(id);
        setSubs(ExpenseStore.getSubscriptions());
    };

    const isDormant = (subId: string) => dormant.some(d => d.id === subId);

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
                        <h1 className="text-lg font-semibold text-white">Subscriptions & Auto-debits</h1>
                        <p className="text-xs text-white/35 mt-0.5">Stop paying for what you don&apos;t use.</p>
                    </div>
                </div>

                {/* Tutorial strip */}
                <div className="bg-[var(--color-rajya-accent)]/8 border border-[var(--color-rajya-accent)]/20 rounded-xl p-3 mb-3">
                    <p className="text-xs text-[var(--color-rajya-muted)]">💡 <strong className="text-[var(--color-rajya-text)]">Small leaks</strong> begin with forgotten logins.</p>
                </div>
                <VideoTutorialPlaceholder youtubeId="iWsQY6Ha4OE" label="Detecting subscription leakage" />
                <div className="h-4" />

                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-white/3 border border-white/8 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-white/30">Monthly Total</p>
                        <p className="text-lg font-bold text-white/70">{monthlyTotal > 0 ? formatRupee(monthlyTotal) : "—"}</p>
                    </div>
                    <div className={`bg-white/3 border rounded-xl p-3 text-center ${annualLeakage > 0 ? "border-red-500/20" : "border-white/8"}`}>
                        <p className="text-[10px] text-white/30">Annual Leakage Est.</p>
                        <p className={`text-lg font-bold ${annualLeakage > 0 ? "text-red-400" : "text-white/70"}`}>
                            {annualLeakage > 0 ? formatRupee(annualLeakage) : "—"}
                        </p>
                    </div>
                </div>

                {/* Dormant alert */}
                {dormant.length > 0 && (
                    <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3 mb-4 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-400">
                            {dormant.length} subscription{dormant.length > 1 ? "s" : ""} unused for 90+ days. Consider cancelling.
                        </p>
                    </div>
                )}

                {/* Subscription list */}
                {subs.length === 0 && !showAdd && (
                    <div className="text-center py-12 mb-4">
                        <p className="text-3xl mb-3">📦</p>
                        <p className="text-sm text-white/50 mb-1">No Subscriptions Tracked</p>
                        <p className="text-xs text-white/30 mb-5">Add subscriptions to detect silent leaks.</p>
                    </div>
                )}

                <div className="space-y-2 mb-5">
                    {subs.map(sub => (
                        <div key={sub.id} className={`bg-white/3 border rounded-xl p-3 ${isDormant(sub.id) ? "border-red-500/20" : "border-white/8"}`}>
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white">{sub.name}</span>
                                    {isDormant(sub.id) && (
                                        <span className="text-[9px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">Dormant</span>
                                    )}
                                </div>
                                <span className="text-sm font-bold text-white/70">{formatRupee(sub.amount)}/mo</span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/30">
                                {sub.renewalDate && <span>Renews: {new Date(sub.renewalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                                {sub.lastUsedDate && <span>Last used: {new Date(sub.lastUsedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                                {sub.autoDebitBank && <span>Auto-debit: {sub.autoDebitBank}</span>}
                            </div>
                            <div className="mt-2 flex justify-end">
                                <button onClick={() => handleDelete(sub.id)} className="text-[10px] text-red-400/60 hover:text-red-400">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add subscription form */}
                {showAdd ? (
                    <div className="bg-white/5 border border-white/15 rounded-xl p-4 mb-5 space-y-3">
                        <p className="text-sm font-medium text-white">Add Subscription</p>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                                <span className="text-[10px] text-red-400">⚠ {error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] text-white/40">Name *</label>
                            <input type="text" placeholder="e.g. Netflix, Gym membership" value={name}
                                onChange={e => { setName(e.target.value); setError(""); }}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-white/40">Category</label>
                            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                                {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-white/40">Amount (monthly) *</label>
                            <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-white/30">₹</span>
                                <input type="number" value={amount} placeholder="0"
                                    onChange={e => { setAmount(e.target.value); setError(""); }}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-6 pr-2 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] text-white/40">Renewal Date</label>
                                <input type="date" value={renewalDate} onChange={e => setRenewalDate(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-white/40">Last Used</label>
                                <input type="date" value={lastUsedDate} onChange={e => setLastUsedDate(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:outline-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-white/40">Auto-Debit Bank (optional)</label>
                            <input type="text" placeholder="e.g. HDFC Salary Account" value={autoDebitBank}
                                onChange={e => setAutoDebitBank(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none" />
                        </div>

                        <div className="flex gap-2">
                            <button onClick={handleSave}
                                className="flex-1 bg-amber-400 text-black font-semibold py-2.5 rounded-lg text-xs">Save</button>
                            <button onClick={() => { setShowAdd(false); setError(""); }}
                                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/40">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setShowAdd(true)}
                        className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Add Subscription
                    </button>
                )}
            </div>
        </div>
    );
}

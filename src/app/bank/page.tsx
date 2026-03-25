"use client";

import { useEffect, useState } from "react";
import { fetchBankSummary, maskAccountNumber, type BankSummary } from "@/lib/bankApi";
import { Droplets, Plus, Landmark, AlertTriangle, Wallet, History, ArrowUpRight, ArrowDownRight, Scale, Info, ShieldAlert } from "lucide-react";
import Link from "next/link";

const PAGE_LOAD_NOW = Date.now();

export default function BankHub() {
    const [summary, setSummary] = useState<BankSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const now = PAGE_LOAD_NOW;

    useEffect(() => {
        let active = true;

        fetchBankSummary()
            .then((data) => {
                if (!active) return;
                setSummary(data);
            })
            .catch((err: unknown) => {
                if (!active) return;
                setError(err instanceof Error ? err.message : "Failed to load bank data.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const accounts = summary?.accounts || [];
    const metrics = summary?.metrics.health;
    const totalLiquid = summary?.metrics.totalLiquid || 0;
    const flow = summary?.metrics.flow || { inflow: 0, outflow: 0, surplus: 0 };

    // Urgent Alerts Logic
    const alerts: { id: string, text: string, type: "critical" | "warning", link: string }[] = [];
    if (metrics) {
        if (metrics.efStatus === "critical") {
            alerts.push({ id: "ef", text: "Emergency fund below 1 month.", type: "critical", link: "/bank/flow" });
        } else if (metrics.efStatus === "low") {
            alerts.push({ id: "ef", text: "Emergency fund below 3 months.", type: "warning", link: "/bank/flow" });
        }

        const dormantUpdates = accounts.filter(a => new Date(a.latestBalanceAsOf) < new Date(now - 60 * 86400000));
        if (dormantUpdates.length > 0) {
            alerts.push({ id: "dormant", text: `${dormantUpdates.length} account(s) not updated in 60 days.`, type: "warning", link: "/bank" });
        }

        if (metrics.idleAccounts.length > 0) {
            alerts.push({ id: "idle", text: `${metrics.idleAccounts.length} account(s) exceed idle threshold.`, type: "warning", link: "/bank/idle" });
        }
    }

    // Helper for Recency text
    const getRecency = (dateStr: string) => {
        const days = Math.floor((now - new Date(dateStr).getTime()) / 86400000);
        if (days < 30) return { text: `Updated ${days === 0 ? "today" : `${days}d ago`}`, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
        if (days <= 60) return { text: `Updated ${days}d ago`, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
        return { text: `Updated ${days}d ago`, color: "text-red-400 bg-red-500/10 border-red-500/20" };
    };

    if (loading) {
        return <main className="min-h-screen flex items-center justify-center text-sm text-white/50">Loading bank data...</main>;
    }

    if (error) {
        return <main className="min-h-screen flex items-center justify-center text-sm text-red-300">{error}</main>;
    }

    return (
        <main className="min-h-screen pb-32 font-sans selection:bg-blue-500/30">
                {/* Header */}
                <header className="px-6 pt-12 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <Droplets className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                                Kosh & Pravah
                            </h1>
                            <p className="text-sm text-[var(--color-rajya-muted)]">Your liquid strength. Your financial breathing space.</p>
                        </div>
                    </div>
                </header>

                <div className="px-6 space-y-6">
                    {/* Top Summary Card */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
                        {/* Decorative background elements */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="flex items-center gap-1.5 mb-2 group relative">
                                <p className="text-sm text-white/60 font-medium uppercase tracking-wider">Total Liquid Assets</p>
                                <Info className="w-3.5 h-3.5 text-white/40 cursor-help" />
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-black/90 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center border border-white/10">
                                    This includes all active bank balances and cash you&apos;ve entered.
                                </div>
                            </div>

                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl text-white/50">₹</span>
                                <h2 className="text-4xl font-bold text-white tracking-tight">
                                    {totalLiquid.toLocaleString("en-IN")}
                                </h2>
                            </div>

                            {/* Health Badges */}
                            <div className="flex flex-col items-center mt-5">
                                {metrics?.outflowIsZero ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-xs text-white/50">Add expenses in Vyaya to calculate emergency readiness.</p>
                                        <Link href="/vyaya" className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors">
                                            Go to Vyaya
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="group relative">
                                        <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 border
                                            ${metrics?.efStatus === "strong" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" :
                                                metrics?.efStatus === "ok" ? "bg-blue-500/20 border-blue-500/30 text-blue-300" :
                                                    metrics?.efStatus === "low" ? "bg-amber-500/20 border-amber-500/30 text-amber-300" :
                                                        "bg-red-500/20 border-red-500/30 text-red-300"}`}>
                                            <Scale className="w-4 h-4" />
                                            {metrics?.emergencyFundMonths.toFixed(1)} Months Covered
                                        </div>
                                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-black/90 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center border border-white/10 z-20">
                                            Emergency Fund = Liquid Assets ÷ Monthly Expenses (from Vyaya).
                                            <br /><br />
                                            {metrics?.efStatus === "critical" ? "Critical: Less than 1 month." :
                                                metrics?.efStatus === "low" ? "Low: Below recommended safety buffer." :
                                                    metrics?.efStatus === "ok" ? "Stable: 3-6 months covered." :
                                                        "Strong: More than 6 months covered."}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mini Cashflow Row */}
                            <div className="w-full mt-6 p-4 rounded-2xl bg-black/20 border border-white/5">
                                <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-3">Monthly Flow Snapshot</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center">
                                        <p className="text-[10px] text-emerald-400/80 uppercase mb-1 flex justify-center items-center gap-1">
                                            <ArrowDownRight className="w-3 h-3" /> Inflow
                                        </p>
                                        <p className="text-sm font-semibold text-white">₹ {(flow.inflow / 1000).toFixed(1)}k</p>
                                    </div>
                                    <div className="text-center border-l border-r border-white/10 px-2">
                                        <p className="text-[10px] text-red-400/80 uppercase mb-1 flex justify-center items-center gap-1">
                                            <ArrowUpRight className="w-3 h-3" /> Outflow
                                        </p>
                                        <p className="text-sm font-semibold text-white">₹ {(flow.outflow / 1000).toFixed(1)}k</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-blue-400/80 uppercase mb-1">Surplus</p>
                                        <p className="text-sm font-semibold text-white">₹ {(flow.surplus / 1000).toFixed(1)}k</p>
                                    </div>
                                </div>
                                {flow.surplus < 0 && (
                                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-red-400 bg-red-500/10 py-1.5 rounded text-center">
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        ⚠ You are spending more than your monthly inflow.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Alerts Section (Conditional) */}
                    {alerts.length > 0 && (
                        <div className="space-y-2">
                            {alerts.map(alert => (
                                <div key={alert.id} className={`p-4 rounded-2xl flex items-center justify-between border ${alert.type === "critical" ? "bg-red-500/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className={`w-5 h-5 ${alert.type === "critical" ? "text-red-400" : "text-amber-400"}`} />
                                        <p className={`text-sm font-medium ${alert.type === "critical" ? "text-red-200" : "text-amber-200"}`}>{alert.text}</p>
                                    </div>
                                    <Link href={alert.link} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${alert.type === "critical" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"}`}>
                                        Review Now
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Navigation Actions Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/bank/add" className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                            <Plus className="w-6 h-6 text-emerald-400" />
                            <span className="text-sm font-medium text-white/80">Add Bank Account</span>
                        </Link>
                        <Link href="/bank/cash" className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                            <Wallet className="w-6 h-6 text-amber-400" />
                            <span className="text-sm font-medium text-white/80">Cash Wallet</span>
                        </Link>
                        <Link href="/bank/flow" className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                            <History className="w-6 h-6 text-blue-400" />
                            <span className="text-sm font-medium text-white/80">Cash Flow Engine</span>
                        </Link>
                        <Link href="/bank/idle" className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                            <Scale className="w-6 h-6 text-purple-400" />
                            <span className="text-sm font-medium text-white/80">Idle Money</span>
                        </Link>
                    </div>

                    {/* Top Accounts List */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-white/90">Bank Accounts</h3>
                        </div>

                        {accounts.length === 0 ? (
                            <div className="text-center py-10 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                                <Landmark className="w-10 h-10 text-white/20 mx-auto mb-3" />
                                        <h3 className="font-semibold text-white/90 mb-1">You haven&apos;t added any bank accounts yet.</h3>
                                <p className="text-sm text-white/50 mb-6">Add your first account to see your true liquidity position.</p>
                                <Link href="/bank/add" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
                                    <Plus className="w-4 h-4" /> Add Your First Account
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {accounts.map(acc => {
                                    const recency = getRecency(acc.latestBalanceAsOf);
                                    return (
                                        <div key={acc.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col relative overflow-hidden group hover:bg-white/10 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center shadow-inner">
                                                        <Landmark className="w-5 h-5 text-white/60" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white leading-tight">
                                                            {acc.nickname || acc.bankName}
                                                        </p>
                                                        <p className="text-[11px] text-white/40 mt-0.5 uppercase tracking-wider flex items-center gap-2">
                                                            {acc.accountType} • {maskAccountNumber(acc.accountLast4)}
                                                            <span className={`px-1.5 py-0.5 rounded text-[8px] border font-bold ${acc.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : acc.status === "dormant" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-white/10 text-white/40 border-white/20"}`}>
                                                                {acc.status}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <p className="text-[10px] text-white/40 mb-1 flex items-center gap-1.5">
                                                        <span className={`px-1.5 py-0.5 border rounded ${recency.color}`}>
                                                            {recency.text}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-white/50">As of {new Date(acc.latestBalanceAsOf).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-white tracking-tight">
                                                        <span className="text-white/40 font-normal mr-1">₹</span>
                                                        {acc.latestBalance.toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-white/5 flex gap-2">
                                                <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white/80 transition-colors">
                                                    Update Balance
                                                </button>
                                                <button className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white/80 transition-colors">
                                                    Timeline
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Trust Footer */}
                <div className="mt-12 px-6 flex items-start gap-3 opacity-50 justify-center text-center pb-8">
                    <ShieldAlert className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-white/60 leading-relaxed max-w-[250px]">
                        Your balances are not auto-synced. All data is entered and stored locally on your device unless you choose cloud backup.
                    </p>
                </div>
            </main>
    );
}

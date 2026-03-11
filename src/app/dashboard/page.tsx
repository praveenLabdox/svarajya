"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Shield, BookOpen, Coins, Activity, Users, AlertCircle, Fingerprint, Key,
    ChevronRight, Sun, Moon, Info, Droplets
} from "lucide-react";
import { IdentityStore } from "@/lib/identityStore";
import { CredentialStore } from "@/lib/credentialStore";
import { IncomeStore, formatRupee } from "@/lib/incomeStore";
import { OnboardingStore } from "@/lib/onboardingStore";
import { ThemeStore, ThemeMode } from "@/lib/themeStore";
import { VideoTutorialPlaceholder } from "@/components/ui/VideoTutorialPlaceholder";

export default function Dashboard() {
    const router = useRouter();
    const [theme, setTheme] = useState<ThemeMode>(() => {
        if (typeof window !== "undefined") {
            ThemeStore.init();
            return ThemeStore.get();
        }
        return "dark";
    });

    // Dynamic identity coverage
    const identityCoverage = IdentityStore.getCoverage();
    const identityCompletion = Math.round((identityCoverage.filled / identityCoverage.total) * 100);
    const identityStatus = identityCompletion >= 80 ? "secure" : identityCompletion >= 30 ? "warning" : "critical";

    // Dynamic credential health
    const credentialHealth = CredentialStore.getCredentialHealth({
        contactPointExists: (id: string) => !!IdentityStore.getContact(id),
        familyMemberExists: () => true,
    });
    const credCompletion = CredentialStore.getPortals().length > 0 ? credentialHealth.overall : 0;
    const credStatus = credCompletion >= 70 ? "secure" : credCompletion >= 30 ? "warning" : "critical";

    // Dynamic Kosh (Treasury) data
    const koshCompletion = IncomeStore.getKoshCompletion();
    const koshStatus = IncomeStore.getKoshStatus();
    const koshMonthly = IncomeStore.getMonthlyNetIncome();
    const koshDesc = koshMonthly > 0 ? `${formatRupee(koshMonthly)}/mo • Strength: ${IncomeStore.getStrengthIndex().overall}` : "Income & treasury management";

    // Dynamic Sthapana (Foundation) coverage
    const onboardingData = OnboardingStore.get();
    let sthapanaCompletion = 10; // Base score for starting
    if (onboardingData.fullName) sthapanaCompletion += 40; // Profile done
    if (onboardingData.familyMembers && onboardingData.familyMembers.length > 0) sthapanaCompletion += 50; // Family done

    // In the future, we'll check for education data as the final 10-20% gap. 
    // Right now, if they did profile + family they get 100% since education module isn't fully integrated into the store yet.
    const sthapanaStatus = sthapanaCompletion >= 80 ? "secure" : "warning";

    const KINGDOM_ZONES = [
        { id: 'foundation', title: 'Sthapana (Foundation)', route: '/foundation', icon: <BookOpen className="w-5 h-5" />, status: sthapanaStatus, completion: sthapanaCompletion, desc: 'Profile, family & education' },
        { id: 'identity', title: 'Pehchaan (Identity)', route: '/identity', icon: <Fingerprint className="w-5 h-5" />, status: identityStatus, completion: identityCompletion, desc: 'Your identity documents' },
        { id: 'credentials', title: 'Kunji (Credentials)', route: '/credentials', icon: <Key className="w-5 h-5" />, status: credStatus, completion: credCompletion, desc: 'Login portals & access' },
        { id: 'protection', title: 'Raksha (Protection)', route: '/raksha', icon: <Shield className="w-5 h-5" />, status: 'warning', completion: 40, desc: 'Insurance & risk cover' },
        { id: 'growth', title: 'Kosh (Treasury)', route: '/kosh', icon: <Coins className="w-5 h-5" />, status: koshStatus, completion: koshCompletion, desc: koshDesc },
        { id: 'bank', title: 'Pravah (Liquidity)', route: '/bank', icon: <Droplets className="w-5 h-5" />, status: 'secure', completion: 100, desc: 'Bank accounts & cashflow' },
        { id: 'control', title: 'Rin (Control)', route: '/rin', icon: <Activity className="w-5 h-5" />, status: 'critical', completion: 10, desc: 'Debt & loan management' },
        { id: 'vyaya', title: 'Vyaya (Expenses)', route: '/vyaya', icon: <Coins className="w-5 h-5" />, status: 'warning', completion: 40, desc: 'Track and control leakage' },
        { id: 'legacy', title: 'Mitra (Legacy)', route: '/mitra', icon: <Users className="w-5 h-5" />, status: 'warning', completion: 30, desc: 'Trusted nominees & legacy' },
    ];

    // Recalculate global stability score based on actual current completions
    const totalCompletion = KINGDOM_ZONES.reduce((sum, zone) => sum + zone.completion, 0);
    const stabilityScore = Math.round(totalCompletion / KINGDOM_ZONES.length);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'secure': return {
                text: 'text-emerald-700',
                border: 'border-emerald-500/30',
                bg: 'bg-emerald-50',
                iconBg: 'bg-emerald-600',
                statusLabel: 'Fortified',
                ctaBg: 'bg-emerald-600 hover:bg-emerald-700',
            };
            case 'warning': return {
                text: 'text-amber-700',
                border: 'border-amber-500/30',
                bg: 'bg-amber-50',
                iconBg: 'bg-amber-600',
                statusLabel: 'Warning',
                ctaBg: 'bg-amber-600 hover:bg-amber-700',
            };
            case 'critical': return {
                text: 'text-red-700',
                border: 'border-red-500/30',
                bg: 'bg-red-50',
                iconBg: 'bg-red-600',
                statusLabel: 'Critical',
                ctaBg: 'bg-red-600 hover:bg-red-700',
            };
            default: return {
                text: 'text-[var(--color-rajya-muted)]',
                border: 'border-white/10',
                bg: 'bg-white/5',
                iconBg: 'bg-slate-600',
                statusLabel: 'Pending',
                ctaBg: 'bg-slate-600 hover:bg-slate-700',
            };
        }
    };

    const handleToggleTheme = () => {
        const next = ThemeStore.toggle();
        setTheme(next);
    };

    return (
        <div className="flex flex-col min-h-screen p-6 pb-24 relative">
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[var(--color-rajya-accent)]/10 to-transparent pointer-events-none" />

            {/* Header with theme toggle */}
            <header className="mb-6 relative z-10 pt-4">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="font-display text-3xl text-[var(--color-rajya-text)]">Rajya Map</h1>
                        <p className="text-[var(--color-rajya-muted)] text-sm uppercase tracking-widest">Oversee your Kingdom</p>
                    </div>
                    <button
                        onClick={handleToggleTheme}
                        className="w-10 h-10 rounded-xl bg-[var(--color-rajya-card)] border border-[var(--color-rajya-accent)]/30 flex items-center justify-center text-[var(--color-rajya-accent)] hover:bg-[var(--color-rajya-accent)]/10 transition-colors"
                        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            {/* Guide Section */}
            <div className="bg-[var(--color-rajya-card)] border border-[var(--color-rajya-accent)]/20 rounded-xl p-4 mb-6 flex items-start gap-3 relative z-10">
                <Info className="w-5 h-5 text-[var(--color-rajya-accent)] shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-[var(--color-rajya-text)]">Your Financial Kingdom</p>
                    <p className="text-xs text-[var(--color-rajya-muted)] leading-relaxed mt-1">Each zone represents a pillar of your financial life. Tap any zone to explore, add data, and strengthen your kingdom.</p>
                </div>
            </div>

            {/* YouTube Tutorial */}
            <div className="mb-6 relative z-10">
                <p className="text-[10px] text-[var(--color-rajya-muted)]/50 uppercase tracking-wider mb-2">🎓 Getting Started</p>
                <VideoTutorialPlaceholder youtubeId="iWsQY6Ha4OE" label="Complete guide to managing your personal finances" />
            </div>

            {/* Stability Score HUD */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--color-rajya-card)] border border-[var(--color-rajya-accent-dim)] rounded-2xl p-6 mb-8 shadow-lg relative overflow-hidden"
            >
                <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--color-rajya-accent)]/10 blur-3xl rounded-full" />

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[var(--color-rajya-text)] font-medium">Kingdom Stability</h2>
                    <span className="text-3xl font-display text-[var(--color-rajya-accent)]">{stabilityScore}%</span>
                </div>

                <div className="h-2 w-full bg-[var(--color-rajya-muted)]/20 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stabilityScore}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-[var(--color-rajya-accent-dim)] to-[var(--color-rajya-accent)]"
                    />
                </div>

                {stabilityScore < 70 && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-rajya-accent)]">
                        <AlertCircle className="w-4 h-4" />
                        <span>Several walls require reinforcement.</span>
                    </div>
                )}
            </motion.div>

            {/* Zone Cards */}
            <div className="grid grid-cols-1 gap-3 flex-1 relative z-10">
                {KINGDOM_ZONES.map((zone, i) => {
                    const config = getStatusConfig(zone.status);
                    return (
                        <motion.button
                            key={zone.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            onClick={() => router.push(zone.route)}
                            className={`w-full text-left p-4 rounded-xl border-2 flex items-center justify-between transition-all hover:scale-[1.01] active:scale-[0.99] ${config.border} ${config.bg}`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Solid colored icon container */}
                                <div className={`w-10 h-10 rounded-lg ${config.iconBg} flex items-center justify-center text-white shadow-sm`}>
                                    {zone.icon}
                                </div>
                                <div>
                                    <h3 className={`font-semibold text-sm ${config.text}`}>{zone.title}</h3>
                                    <p className="text-xs text-[var(--color-rajya-muted)] mt-0.5">{zone.desc}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="h-1.5 w-14 bg-[var(--color-rajya-muted)]/20 rounded-full overflow-hidden">
                                            <div className={`h-full ${config.iconBg} rounded-full`} style={{ width: `${zone.completion}%` }} />
                                        </div>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${config.text}`}>
                                            {config.statusLabel}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Clear CTA button instead of faint arrow */}
                            <div className={`px-3 py-1.5 rounded-lg ${config.ctaBg} text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm`}>
                                Open
                                <ChevronRight className="w-3 h-3" />
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Leakage Audit Quick Trigger */}
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onClick={() => router.push('/leakage')}
                className="mt-6 w-full bg-[var(--color-rajya-card)] border-2 border-[var(--color-rajya-accent)]/50 text-[var(--color-rajya-accent)] p-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs font-bold hover:bg-[var(--color-rajya-accent)]/10 transition-colors"
            >
                <Activity className="w-4 h-4" /> Run Leakage Audit
            </motion.button>
        </div>
    );
}

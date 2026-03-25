"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, AlertTriangle, Users } from "lucide-react";
import { CredentialStore } from "@/lib/credentialStore";
import { IdentityStore } from "@/lib/identityStore";


export default function AccessOverviewPage() {
    const router = useRouter();
    const portals = CredentialStore.getPortals();
    const allAccess = CredentialStore.getAllAccess();

    // Group access by family member
    const groupedByMember: Record<string, { viewer: number; executor: number; emergency_only: number }> = {};
    for (const access of allAccess) {
        if (access.accessLevel === "no_access") continue;
        if (!groupedByMember[access.familyMemberId]) {
            groupedByMember[access.familyMemberId] = { viewer: 0, executor: 0, emergency_only: 0 };
        }
        if (access.accessLevel in groupedByMember[access.familyMemberId]) {
            groupedByMember[access.familyMemberId][access.accessLevel as keyof typeof groupedByMember[string]]++;
        }
    }

    // Flags
    const portalsWithNoAccess = portals.filter(p => {
        const portalAccess = allAccess.filter(a => a.portalId === p.id && a.accessLevel !== "no_access");
        return portalAccess.length === 0;
    });
    const portalsWithNoExecutor = portals.filter(p => {
        return !allAccess.some(a => a.portalId === p.id && a.accessLevel === "executor");
    });

    // Emergency readiness
    const deps = {
        contactPointExists: (id: string) => !!IdentityStore.getContact(id),
        familyMemberExists: () => true,
    };
    const readiness = CredentialStore.getEmergencyReadiness(deps);
    const readyCount = Object.values(readiness).filter(Boolean).length;
    const readinessPercent = portals.length > 0 ? Math.round((readyCount / portals.length) * 100) : 0;
    const readinessLabel = readinessPercent >= 80 ? "High" : readinessPercent >= 40 ? "Medium" : "Low";
    const readinessColor = readinessPercent >= 80 ? "text-emerald-400" : readinessPercent >= 40 ? "text-amber-400" : "text-red-400";

    return (
        <div className="flex flex-col min-h-screen p-6 pb-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <div className="flex items-center gap-3 pt-8 mb-6">
                    <button onClick={() => router.push("/credentials")} className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0">
                        <ArrowLeft className="w-4 h-4 text-white/60" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-white">Access Control Overview</h1>
                        <p className="text-xs text-white/35 mt-0.5">Ensure the right people have the right access.</p>
                    </div>
                </div>

                {/* Emergency Readiness */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40">Emergency Readiness</span>
                        <span className={`text-sm font-semibold ${readinessColor}`}>{readinessLabel} ({readinessPercent}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                        <div className={`h-full rounded-full transition-all duration-700 ${readinessPercent >= 80 ? "bg-emerald-400" : readinessPercent >= 40 ? "bg-amber-400" : "bg-red-400"}`}
                            style={{ width: `${readinessPercent}%` }} />
                    </div>
                </div>

                {/* Family Member Cards */}
                <div className="flex-1 space-y-4">
                    {Object.keys(groupedByMember).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Users className="w-10 h-10 text-white/10 mb-3" />
                            <p className="text-sm text-white/30 mb-1">No access assigned yet</p>
                            <p className="text-xs text-white/20 text-center mb-5">Open a portal and assign family members to control access.</p>
                        </div>
                    ) : (
                        Object.entries(groupedByMember).map(([memberId, counts]) => {
                            return (
                                <div key={memberId} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-medium text-white">{memberId}</p>
                                        <ShieldCheck className={`w-4 h-4 ${counts.executor > 0 ? "text-emerald-400" : "text-white/15"}`} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-amber-400/5 rounded-lg px-2.5 py-2 text-center">
                                            <p className="text-sm font-semibold text-amber-400">{counts.executor}</p>
                                            <p className="text-[10px] text-white/30">Executor</p>
                                        </div>
                                        <div className="bg-white/3 rounded-lg px-2.5 py-2 text-center">
                                            <p className="text-sm font-semibold text-white/60">{counts.viewer}</p>
                                            <p className="text-[10px] text-white/30">Viewer</p>
                                        </div>
                                        <div className="bg-red-400/5 rounded-lg px-2.5 py-2 text-center">
                                            <p className="text-sm font-semibold text-red-400/70">{counts.emergency_only}</p>
                                            <p className="text-[10px] text-white/30">Emergency</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Flags */}
                    {(portalsWithNoAccess.length > 0 || portalsWithNoExecutor.length > 0) && (
                        <div className="bg-white/3 border border-white/8 rounded-xl p-3.5 space-y-2 mt-4">
                            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Flags</p>
                            {portalsWithNoExecutor.length > 0 && (
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-400/70">{portalsWithNoExecutor.length} portal{portalsWithNoExecutor.length > 1 ? "s have" : " has"} no executor assigned</p>
                                </div>
                            )}
                            {portalsWithNoAccess.length > 0 && (
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-red-400/70">{portalsWithNoAccess.length} portal{portalsWithNoAccess.length > 1 ? "s have" : " has"} no access assigned at all</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* CTA */}
                {portalsWithNoAccess.length > 0 && (
                    <div className="pb-4 pt-4">
                        <button onClick={() => {
                            const first = portalsWithNoAccess[0];
                            if (first) router.push(`/credentials/portal/${first.id}`);
                        }}
                            className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm hover:bg-amber-300 transition-colors">
                            Review Unassigned Portals
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

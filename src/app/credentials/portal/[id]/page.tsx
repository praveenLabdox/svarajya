"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Trash2, ShieldCheck, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { CredentialStore, PORTAL_CATEGORIES, PortalRecord, AccessLevel, EmergencyRule } from "@/lib/credentialStore";
import { IdentityStore } from "@/lib/identityStore";
import { OnboardingStore } from "@/lib/onboardingStore";
import { MasterPassphraseModal } from "@/components/credentials/MasterPassphraseModal";

const ACCESS_LABELS: Record<AccessLevel, string> = {
    viewer: "Viewer", executor: "Executor", emergency_only: "Emergency Only", no_access: "No Access",
};

export default function PortalDetailPage() {
    const router = useRouter();
    const params = useParams();
    const portalId = params.id as string;

    const portal = CredentialStore.getPortalById(portalId);
    const [editing, setEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPassModal, setShowPassModal] = useState<"create" | "unlock" | "reset" | null>(null);
    const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState("");

    // Access assignment state
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [newAccessName, setNewAccessName] = useState("");
    const [newAccessLevel, setNewAccessLevel] = useState<AccessLevel>("viewer");
    const [newAccessRule, setNewAccessRule] = useState<EmergencyRule>("manual");

    // Edit fields
    const [platformName] = useState(portal?.platformName || "");
    const [loginId, setLoginId] = useState(portal?.loginId || "");
    const [twoFA, setTwoFA] = useState(portal?.twoFAStatus || "unknown");
    const [notes, setNotes] = useState(portal?.notes || "");

    if (!portal) {
        return (
            <div className="flex flex-col min-h-screen p-6 items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
                <p className="relative z-10 text-white/40">Portal not found.</p>
                <button onClick={() => router.push("/credentials")} className="relative z-10 text-amber-400 text-sm mt-3">Back to Kunji Vault</button>
            </div>
        );
    }

    const catMeta = PORTAL_CATEGORIES.find(c => c.id === portal.category);
    const access = CredentialStore.getAccessForPortal(portalId);
    const contacts = IdentityStore.getContacts();
    const linkedMobile = portal.registeredMobileId ? contacts.find(c => c.id === portal.registeredMobileId) : null;
    const linkedEmail = portal.registeredEmailId ? contacts.find(c => c.id === portal.registeredEmailId) : null;
    const familyMembers = OnboardingStore.get().familyMembers || [];

    // Health score
    const deps = {
        contactPointExists: (id: string) => !!IdentityStore.getContact(id),
        familyMemberExists: () => true,
    };
    const health = CredentialStore.getCredentialHealth(deps);
    const portalHealth = health.perPortal[portalId] || 0;
    const healthColor = portalHealth >= 70 ? "text-emerald-400" : portalHealth >= 40 ? "text-amber-400" : "text-red-400";

    // Emergency readiness
    const readiness = CredentialStore.getEmergencyReadiness(deps);
    const isReady = readiness[portalId];

    const handleSaveEdit = () => {
        CredentialStore.updatePortal(portalId, {
            platformName: platformName.trim(),
            loginId: loginId.trim(),
            twoFAStatus: twoFA as PortalRecord["twoFAStatus"],
            notes: notes.trim() || undefined,
            lastReviewedDate: new Date().toISOString().split("T")[0],
        });
        setEditing(false);
        setToast("Saved");
        setTimeout(() => setToast(""), 2000);
    };

    const handleRevealPassword = () => {
        if (!CredentialStore.isVaultCreated()) return;
        if (!CredentialStore.isVaultUnlocked()) {
            setShowPassModal("unlock");
            return;
        }
        // In V1, show a placeholder since real decryption requires the passphrase key
        setRevealedPassword("••• Encrypted (unlock required for real decryption) •••");
        setShowPassword(true);
    };

    const handleAddAccess = () => {
        if (!newAccessName.trim()) return;
        CredentialStore.addAccess({
            portalId,
            familyMemberId: newAccessName.trim(), // In V1, we use name as ID
            accessLevel: newAccessLevel,
            emergencyRule: newAccessRule,
            lastReviewedDate: new Date().toISOString().split("T")[0],
        });
        setShowAccessModal(false);
        setNewAccessName("");
        setNewAccessLevel("viewer");
        setToast("Access assigned");
        setTimeout(() => setToast(""), 2000);
    };

    return (
        <div className="flex flex-col min-h-screen p-6 pb-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <div className="flex items-center justify-between pt-8 mb-5">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push("/credentials")} className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0">
                            <ArrowLeft className="w-4 h-4 text-white/60" />
                        </button>
                        <div>
                            <p className="text-[10px] text-amber-400/60 uppercase tracking-wider">{catMeta?.emoji} {catMeta?.label}</p>
                            <h1 className="text-lg font-semibold text-white">{portal.platformName}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${healthColor}`}>{portalHealth}%</span>
                        {isReady && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    </div>
                </div>

                {toast && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3 mb-4 text-center text-sm text-emerald-400">
                        ✔ {toast}
                    </div>
                )}

                <div className="flex-1 space-y-4">
                    {/* Login Details */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider">Login Details</p>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-xs text-white/40">Login ID</span>
                                {editing
                                    ? <input type="text" value={loginId} onChange={e => setLoginId(e.target.value)}
                                        className="bg-white/6 border border-white/15 rounded-lg px-2 py-1 text-xs text-white text-right w-40 focus:outline-none" />
                                    : <span className="text-xs text-white">{CredentialStore.maskLoginId(portal.loginId)}</span>}
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-white/40">Registered Mobile</span>
                                <span className="text-xs text-white/70">{linkedMobile ? linkedMobile.value : "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-white/40">Registered Email</span>
                                <span className="text-xs text-white/70">{linkedEmail ? linkedEmail.value : "—"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-white/40">2FA</span>
                                {editing ? (
                                    <div className="flex gap-1">
                                        {(["enabled", "disabled", "unknown"] as const).map(v => (
                                            <button key={v} onClick={() => setTwoFA(v)}
                                                className={`text-[10px] px-2 py-1 rounded-lg border ${twoFA === v ? "border-amber-400 text-amber-400 bg-amber-400/10" : "border-white/10 text-white/30"}`}>
                                                {v === "enabled" ? "Yes" : v === "disabled" ? "No" : "?"}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <span className={`text-xs ${portal.twoFAStatus === "enabled" ? "text-emerald-400" : "text-white/40"}`}>
                                        {portal.twoFAStatus === "enabled" ? "Enabled" : portal.twoFAStatus === "disabled" ? "Disabled" : "Unknown"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Password Strategy */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                        <p className="text-[10px] text-white/30 uppercase tracking-wider">Password Strategy</p>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-white/70">
                                {portal.passwordStorageMode === "encrypted" ? "🔐 Stored Encrypted" : "🔒 Not Stored"}
                            </span>
                            {portal.passwordStorageMode === "encrypted" && (
                                <button onClick={handleRevealPassword} className="text-xs text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/30">
                                    {showPassword ? <EyeOff className="w-3 h-3 inline mr-1" /> : <Eye className="w-3 h-3 inline mr-1" />}
                                    {showPassword ? "Hide" : "Reveal Password"}
                                </button>
                            )}
                        </div>
                        {showPassword && revealedPassword && (
                            <p className="text-xs text-white/50 bg-black/30 rounded-lg px-3 py-2 font-mono">{revealedPassword}</p>
                        )}
                        {portal.passwordStorageMode === "not_stored" && (
                            <p className="text-[10px] text-white/20 italic">Remember to store your password securely elsewhere.</p>
                        )}
                    </div>

                    {/* Access Mapping */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] text-white/30 uppercase tracking-wider">Access Mapping</p>
                            <button onClick={() => setShowAccessModal(true)} className="text-[10px] text-amber-400">+ Assign</button>
                        </div>
                        {access.length === 0 ? (
                            <p className="text-xs text-white/20 italic">No access assigned. Assign to improve emergency readiness.</p>
                        ) : (
                            <div className="space-y-2">
                                {access.map(a => (
                                    <div key={a.id} className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-2">
                                        <div>
                                            <p className="text-xs text-white">{a.familyMemberId}</p>
                                            <p className="text-[10px] text-white/30">{a.emergencyRule === "manual" ? "Manual activation" : `After ${a.emergencyRule.replace("after_", "")} inactivity`}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.accessLevel === "executor" ? "bg-amber-400/10 text-amber-400" :
                                                a.accessLevel === "emergency_only" ? "bg-red-400/10 text-red-400" : "bg-white/10 text-white/50"}`}>
                                                {ACCESS_LABELS[a.accessLevel]}
                                            </span>
                                            <button onClick={() => { CredentialStore.deleteAccess(a.id); setToast("Access removed"); setTimeout(() => setToast(""), 2000); }}
                                                className="text-white/15 hover:text-red-400">✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    {editing ? (
                        <div className="space-y-2">
                            <label className="text-xs text-white/40">Notes</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                                className="w-full bg-white/6 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none resize-none" />
                        </div>
                    ) : portal.notes ? (
                        <div className="bg-white/3 rounded-xl p-3">
                            <p className="text-[10px] text-white/30 mb-1">Notes</p>
                            <p className="text-xs text-white/50">{portal.notes}</p>
                        </div>
                    ) : null}

                    {/* Emergency readiness status */}
                    <div className={`rounded-xl p-3 flex items-center gap-2 ${isReady ? "bg-emerald-400/5 border border-emerald-400/20" : "bg-amber-400/5 border border-amber-400/20"}`}>
                        {isReady
                            ? <><ShieldCheck className="w-4 h-4 text-emerald-400" /><span className="text-xs text-emerald-400">✔ Emergency Ready</span></>
                            : <><AlertTriangle className="w-4 h-4 text-amber-400" /><span className="text-xs text-amber-400/70">⚠ Not fully emergency ready</span></>}
                    </div>

                    {/* Last reviewed */}
                    {portal.lastReviewedDate && (
                        <p className="text-[10px] text-white/20 text-center">Last reviewed: {portal.lastReviewedDate}</p>
                    )}
                </div>

                {/* CTAs */}
                <div className="pb-4 pt-4 space-y-3">
                    {editing ? (
                        <button onClick={handleSaveEdit} className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm">Save Changes</button>
                    ) : (
                        <button onClick={() => setEditing(true)} className="w-full bg-white/8 border border-white/15 text-white/70 py-4 rounded-xl text-sm">Edit Details</button>
                    )}
                    <button onClick={() => setShowDeleteModal(true)} className="w-full text-center text-xs text-red-400/50 hover:text-red-400 py-2 transition-colors">
                        🗑️ Delete this portal
                    </button>
                </div>
            </div>

            {/* Delete Confirmation */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-slate-900 border border-white/15 rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <Trash2 className="w-8 h-8 text-red-400 mx-auto mb-3" />
                        <h2 className="text-white font-semibold text-center mb-1">Delete Portal?</h2>
                        <p className="text-xs text-white/35 text-center mb-4">Are you sure you want to delete this portal? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-white/50">Cancel</button>
                            <button onClick={() => { CredentialStore.deletePortal(portalId); router.push("/credentials"); }}
                                className="flex-1 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-sm text-red-400 font-medium">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Access Assignment Modal */}
            {showAccessModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setShowAccessModal(false)}>
                    <div className="bg-slate-900 border border-white/15 rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h2 className="text-white font-semibold mb-4">Assign Access</h2>
                        <div className="space-y-3">
                            <input type="text" list="family-members-list" placeholder="Family member name" value={newAccessName} onChange={e => setNewAccessName(e.target.value)}
                                className="w-full bg-white/6 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none" />
                            <datalist id="family-members-list">
                                {familyMembers.map(m => (
                                    <option key={m.id} value={m.name} />
                                ))}
                            </datalist>
                            {newAccessName && !familyMembers.some(m => m.name.toLowerCase() === newAccessName.toLowerCase()) && (
                                <p className="text-[10px] text-amber-400 mt-0.5">This member is not in your Foundation Family list. You can proceed, but consider adding them later.</p>
                            )}
                            <div className="space-y-1">
                                <label className="text-xs text-white/40">Access Level</label>
                                <div className="flex gap-2 flex-wrap">
                                    {(["viewer", "executor", "emergency_only"] as AccessLevel[]).map(lvl => (
                                        <button key={lvl} onClick={() => setNewAccessLevel(lvl)}
                                            className={`text-xs px-3 py-2 rounded-xl border ${newAccessLevel === lvl
                                                ? "bg-amber-400/15 border-amber-400 text-amber-400"
                                                : "bg-white/5 border-white/10 text-white/40"}`}>
                                            {ACCESS_LABELS[lvl]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-white/40">Emergency Activation</label>
                                <select value={newAccessRule} onChange={e => setNewAccessRule(e.target.value as EmergencyRule)}
                                    className="w-full bg-white/6 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
                                    <option value="manual">Manual</option>
                                    <option value="after_7d">After 7 days inactivity</option>
                                    <option value="after_30d">After 30 days inactivity</option>
                                    <option value="after_90d">After 90 days inactivity</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setShowAccessModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-white/50">Cancel</button>
                            <button onClick={handleAddAccess} className="flex-1 py-3 rounded-xl bg-amber-400 text-black text-sm font-semibold">Assign</button>
                        </div>
                    </div>
                </div>
            )}

            {showPassModal && (
                <MasterPassphraseModal mode={showPassModal} onClose={() => setShowPassModal(null)} />
            )}
        </div>
    );
}

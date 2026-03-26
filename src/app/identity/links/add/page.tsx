"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { IdentityStore, DocType } from "@/lib/identityStore";

const SERVICE_TYPES = [
    { id: "bank", label: "Bank", emoji: "🏦" },
    { id: "tax", label: "Income Tax", emoji: "📋" },
    { id: "insurance", label: "Insurance", emoji: "🛡️" },
    { id: "investment", label: "Investment", emoji: "📈" },
    { id: "utility", label: "Utility", emoji: "⚡" },
    { id: "other", label: "Other", emoji: "📎" },
] as const;

const SUGGESTED_SERVICES: Record<string, string[]> = {
    bank: ["HDFC Netbanking", "SBI Internet Banking", "ICICI iMobile", "Axis Mobile", "Kotak 811"],
    tax: ["Income Tax Portal", "GST Portal", "TDS Portal"],
    insurance: ["LIC", "HDFC Life", "ICICI Prudential", "Star Health", "Policy Bazaar"],
    investment: ["Zerodha", "Groww", "Upstox", "MF Central", "NPS Portal"],
    utility: ["Electricity Board", "Gas Connection", "Broadband", "Mobile Postpaid"],
    other: [],
};

type Step = 1 | 2;

function LinkWizardForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preDocId = searchParams.get("docId") || "";

    // Seed contacts from onboarding
    IdentityStore.seedFromOnboarding();
    const docs = IdentityStore.getDocs();
    const contacts = IdentityStore.getContacts();

    const [step, setStep] = useState<Step>(1);
    const [docId, setDocId] = useState(preDocId);
    const [serviceType, setServiceType] = useState("");
    const [serviceName, setServiceName] = useState("");
    const [customName, setCustomName] = useState("");
    // Auto-select the first contact if available
    const [contactPointId, setContactPointId] = useState(contacts.length > 0 ? contacts[0].id : "");
    const [newMobile, setNewMobile] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    const selectedDoc = docs.find(d => d.id === docId);
    const suggestions = SUGGESTED_SERVICES[serviceType] || [];

    const handleAddContact = (type: "mobile" | "email", value: string) => {
        if (!value.trim()) return;
        const cp = IdentityStore.addContact(type, value.trim());
        setContactPointId(cp.id);
        if (type === "mobile") setNewMobile(""); else setNewEmail("");
    };

    const handleSave = () => {
        if (!docId) { setError("Please select a document."); return; }
        if (!serviceType) { setError("Please select a service type."); return; }
        const name = serviceName === "custom" ? customName : serviceName;
        if (!name) { setError("Please select or enter a service name."); return; }
        if (!contactPointId) { setError("Please select a contact method."); return; }

        IdentityStore.addLink({
            docId,
            serviceType: serviceType as "bank" | "tax" | "insurance" | "investment" | "utility" | "other",
            serviceName: name,
            contactPointId,
            confidence: "confirmed",
        });
        setSaved(true);
    };

    // ——— Success ———
    if (saved) {
        const health = IdentityStore.getConfidence();
        return (
            <div className="flex flex-col min-h-screen p-6 pb-24 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
                <div className="relative z-10 flex flex-col min-h-screen items-center justify-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                        className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </motion.div>
                    <h1 className="text-lg font-semibold text-white mb-1">Link Added Successfully</h1>
                    <p className="text-sm text-white/40 mb-6">Identity Link Health: <span className="text-amber-400 font-bold">{health}%</span></p>
                    <div className="w-full space-y-3">
                        <button onClick={() => { setSaved(false); setStep(1); setServiceType(""); setServiceName(""); }}
                            className="w-full bg-amber-400 text-black font-semibold py-3 rounded-xl text-sm">Add Another Link</button>
                        <button onClick={() => router.push("/identity")}
                            className="w-full text-white/35 text-sm py-3">Back to Vault</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen p-6 pb-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <div className="flex items-center gap-3 pt-8 mb-6">
                    <button onClick={() => step === 1 ? router.back() : setStep(1)} className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0">
                        <ArrowLeft className="w-4 h-4 text-white/60" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-white">Link This Document</h1>
                        <p className="text-xs text-white/35 mt-0.5">Step {step} of 2</p>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex gap-2 mb-6">
                    {[1, 2].map(s => (
                        <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-amber-400" : "bg-white/10"}`} />
                    ))}
                </div>

                <div className="flex-1 space-y-5">
                    {/* Step 1: Select document + service type + service name */}
                    {step === 1 && (
                        <>
                            {!preDocId && (
                                <div className="space-y-2">
                                    <label className="text-xs text-white/40 uppercase tracking-wider">Document</label>
                                    <div className="space-y-2">
                                        {docs.map(d => (
                                            <button key={d.id} onClick={() => setDocId(d.id)}
                                                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${docId === d.id ? "bg-amber-400/15 border-amber-400 text-amber-400" : "bg-white/5 border-white/10 text-white/55"
                                                    }`}>
                                                {d.docType.toUpperCase()} — {IdentityStore.maskDocNumber(d.docNumber, d.docType as DocType)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selectedDoc && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white/40">
                                    Linking: <span className="text-amber-400">{selectedDoc.docType.toUpperCase()}</span> — {IdentityStore.maskDocNumber(selectedDoc.docNumber, selectedDoc.docType)}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-xs text-white/40 uppercase tracking-wider">Service Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SERVICE_TYPES.map(st => (
                                        <button key={st.id} onClick={() => { setServiceType(st.id); setServiceName(""); setError(""); }}
                                            className={`py-3 px-3 rounded-xl border text-sm text-left transition-all flex items-center gap-2 ${serviceType === st.id ? "bg-amber-400/15 border-amber-400 text-amber-400" : "bg-white/5 border-white/10 text-white/55"
                                                }`}>
                                            <span>{st.emoji}</span> {st.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 2: Service name + contact */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div className="space-y-3">
                                <label className="text-xs text-white/40 uppercase tracking-wider">Service Name</label>
                                {suggestions.length > 0 && (
                                    <div className="space-y-2">
                                        {suggestions.map(name => (
                                            <button key={name} onClick={() => setServiceName(name)}
                                                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${serviceName === name ? "bg-amber-400/15 border-amber-400 text-amber-400" : "bg-white/5 border-white/10 text-white/55"
                                                    }`}>
                                                {name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <button onClick={() => setServiceName("custom")}
                                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${serviceName === "custom" ? "bg-amber-400/15 border-amber-400 text-amber-400" : "bg-white/5 border-white/10 text-white/55"
                                        }`}>
                                    Custom — enter name
                                </button>
                                {serviceName === "custom" && (
                                    <input type="text" placeholder="Enter service name" value={customName} onChange={e => setCustomName(e.target.value)}
                                        className="w-full bg-white/6 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-400/60" />
                                )}
                            </div>

                            {/* Contact — pre-filled from onboarding */}
                            <div className="space-y-2">
                                <label className="text-xs text-white/40 uppercase tracking-wider">Registered Contact</label>
                                {contacts.length > 0 && (
                                    <div className="space-y-2">
                                        {contacts.map(c => (
                                            <button key={c.id} onClick={() => setContactPointId(c.id)}
                                                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${contactPointId === c.id ? "bg-amber-400/15 border-amber-400 text-amber-400" : "bg-white/5 border-white/10 text-white/55"
                                                    }`}>
                                                {c.type === "mobile" ? "📱" : "📧"} {c.value} {c.label ? `(${c.label})` : ""}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <p className="text-[10px] text-white/25">Want to use a different number? Add below.</p>
                                <div className="flex gap-2">
                                    <input type="tel" placeholder="Add mobile" value={newMobile} onChange={e => setNewMobile(e.target.value)}
                                        className="flex-1 bg-white/6 border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none" />
                                    <button onClick={() => handleAddContact("mobile", newMobile)} className="px-3 bg-amber-400/15 border border-amber-400/30 rounded-xl text-xs text-amber-400">Add</button>
                                </div>
                                <div className="flex gap-2">
                                    <input type="email" placeholder="Add email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                                        className="flex-1 bg-white/6 border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none" />
                                    <button onClick={() => handleAddContact("email", newEmail)} className="px-3 bg-amber-400/15 border border-amber-400/30 rounded-xl text-xs text-amber-400">Add</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-red-400 text-xs">⚠ {error}</p>}
                </div>

                {/* CTA */}
                <div className="pb-4 pt-4">
                    {step < 2 ? (
                        <button onClick={() => {
                            if (!docId) { setError("Please select a document."); return; }
                            if (!serviceType) { setError("Please select a service type."); return; }
                            setError(""); setStep(2);
                        }} className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm hover:bg-amber-300 transition-colors">
                            Continue
                        </button>
                    ) : (
                        <button onClick={handleSave} className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm hover:bg-amber-300 transition-colors">
                            Save Link
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function LinkWizard() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
            <LinkWizardForm />
        </Suspense>
    );
}

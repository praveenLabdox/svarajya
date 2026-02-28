"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, BellOff, Calendar } from "lucide-react";
import { IdentityStore, DocType } from "@/lib/identityStore";

const REMINDER_OPTIONS = [90, 60, 30, 7];

export default function Renewals() {
    const router = useRouter();
    const docs = IdentityStore.getDocs();
    const reminders = IdentityStore.getReminders();
    const annualDate = IdentityStore.getAnnualKycDate();

    const [reminderModal, setReminderModal] = useState<string | null>(null);
    const [annualKyc, setAnnualKyc] = useState(annualDate || "");
    const [toast, setToast] = useState("");

    const [now] = useState(() => Date.now());

    const docsWithExpiry = docs.filter(d => d.expiryDate).sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());
    const docsNoExpiry = docs.filter(d => !d.expiryDate);
    const expiringIn30 = docsWithExpiry.filter(d => {
        const days = Math.ceil((new Date(d.expiryDate!).getTime() - now) / (1000 * 60 * 60 * 24));
        return days <= 30;
    }).length;

    const getDaysUntil = (date: string) => Math.ceil((new Date(date).getTime() - now) / (1000 * 60 * 60 * 24));

    const getColorClass = (days: number) => {
        if (days < 30) return { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", dot: "bg-red-500" };
        if (days < 180) return { bg: "bg-amber-400/10", border: "border-amber-400/30", text: "text-amber-400", dot: "bg-amber-400" };
        return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-500" };
    };

    const handleSetReminder = (docId: string, days: number) => {
        IdentityStore.addReminder(docId, days);
        setReminderModal(null);
        setToast("Reminder Scheduled");
        setTimeout(() => setToast(""), 2000);
    };

    const handleAnnualKyc = (date: string) => {
        setAnnualKyc(date);
        IdentityStore.setAnnualKycDate(date || null);
        if (date) {
            setToast("Annual KYC date set");
            setTimeout(() => setToast(""), 2000);
        }
    };

    const hasReminder = (docId: string) => reminders.some(r => r.docId === docId);

    return (
        <div className="flex flex-col min-h-screen p-6 pb-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <div className="flex items-center gap-3 pt-8 mb-6">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0">
                        <ArrowLeft className="w-4 h-4 text-white/60" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-white">Validity & Renewal Tracker</h1>
                        <p className="text-xs text-white/35 mt-0.5">{docsWithExpiry.length > 0 ? `${docsWithExpiry.length} document(s) with expiry dates` : "Track your document expiry dates"}</p>
                    </div>
                </div>

                {toast && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3 mb-4 text-center text-sm text-emerald-400">
                        ✔ {toast}
                    </div>
                )}

                {/* Summary alert */}
                {expiringIn30 > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-red-400 shrink-0" />
                        <p className="text-xs text-red-400">{expiringIn30} document(s) expiring within 30 days.</p>
                    </div>
                )}

                <div className="flex-1 space-y-4">
                    {/* Timeline */}
                    {docsWithExpiry.length > 0 ? (
                        <div className="space-y-3">
                            {docsWithExpiry.map(doc => {
                                const days = getDaysUntil(doc.expiryDate!);
                                const color = getColorClass(days);
                                return (
                                    <div key={doc.id} className="flex gap-3">
                                        {/* Timeline dot + line */}
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full ${color.dot} shrink-0 mt-1`} />
                                            <div className="w-0.5 flex-1 bg-white/8" />
                                        </div>
                                        {/* Card */}
                                        <div className={`flex-1 ${color.bg} border ${color.border} rounded-xl p-4 mb-1`}>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-white">{doc.docType.toUpperCase()}</p>
                                                    <p className="text-xs text-white/40 mt-0.5">{IdentityStore.maskDocNumber(doc.docNumber, doc.docType as DocType)}</p>
                                                </div>
                                                <span className={`text-xs font-semibold ${color.text}`}>
                                                    {days > 0 ? `${days} days` : "Expired"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/30 mt-2">Expires: {doc.expiryDate}</p>
                                            <div className="flex items-center gap-2 mt-3">
                                                {hasReminder(doc.id) ? (
                                                    <div className="flex items-center gap-1 text-emerald-400 text-xs">
                                                        <Bell className="w-3 h-3" /> Reminder set
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setReminderModal(doc.id)}
                                                        className="px-3 py-1.5 bg-white/8 border border-white/15 rounded-lg text-xs text-white/50 hover:text-white/80 transition-colors">
                                                        Set Reminder
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                            <BellOff className="w-8 h-8 text-white/15 mx-auto mb-3" />
                            <p className="text-sm text-white/40">No upcoming renewals.</p>
                            <p className="text-xs text-white/25 mt-1">Review once a year.</p>
                        </div>
                    )}

                    {/* No-expiry docs */}
                    {docsNoExpiry.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-white/30 uppercase tracking-wider">No Expiry</p>
                            {docsNoExpiry.map(doc => (
                                <div key={doc.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-white/60">{doc.docType.toUpperCase()}</p>
                                        <p className="text-xs text-white/30">{IdentityStore.maskDocNumber(doc.docNumber, doc.docType as DocType)}</p>
                                    </div>
                                    <span className="text-[10px] text-white/20 uppercase">No expiry</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Annual KYC */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-amber-400" />
                            <p className="text-sm text-white font-medium">Annual KYC Review Day</p>
                        </div>
                        <p className="text-xs text-white/30 mb-3">Set a yearly reminder to review all documents.</p>
                        <input type="date" value={annualKyc} onChange={e => handleAnnualKyc(e.target.value)}
                            className="w-full bg-white/6 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/60" />
                    </div>
                </div>

                {/* Reminder modal */}
                {reminderModal && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setReminderModal(null)}>
                        <div className="bg-slate-900 border border-white/15 rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                            <h2 className="text-white font-semibold mb-1">Set Renewal Reminder</h2>
                            <p className="text-xs text-white/35 mb-4">Choose when to be reminded.</p>
                            <div className="space-y-2">
                                {REMINDER_OPTIONS.map(days => (
                                    <button key={days} onClick={() => handleSetReminder(reminderModal, days)}
                                        className="w-full text-left px-4 py-3 rounded-xl border bg-white/5 border-white/10 text-sm text-white/60 hover:border-amber-400/40 transition-colors">
                                        {days} days before expiry
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setReminderModal(null)} className="w-full text-white/30 text-xs py-3 mt-2">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

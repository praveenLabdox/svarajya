"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Link2, Bell, Edit3, Trash2 } from "lucide-react";
import { IdentityStore, calcSealStrength, IdentityDoc, ContactPoint } from "@/lib/identityStore";
import { OnboardingStore } from "@/lib/onboardingStore";
import { SealStrengthRing } from "@/components/identity/SealStrengthRing";
import { FileUploader } from "@/components/vault/FileUploader";

const VERIFICATION_OPTIONS = [
    { value: "not_verified", label: "Not Verified" },
    { value: "self", label: "Self Verified" },
    { value: "govt", label: "Govt Verified" },
    { value: "ca", label: "Verified by CA" },
    { value: "agent", label: "Verified by Agent" },
    { value: "family", label: "Verified by Family Member" },
];

export default function DocDetail() {
    const router = useRouter();
    const params = useParams();
    const docId = params.id as string;

    // Ensure onboarding contacts are seeded
    IdentityStore.seedFromOnboarding();

    const initialDoc = IdentityStore.getDoc(docId);
    const initialContacts = IdentityStore.getContacts();
    const initialMobiles = initialContacts.filter(c => c.type === "mobile");
    const initialEmails = initialContacts.filter(c => c.type === "email");

    const [doc, setDoc] = useState<IdentityDoc | undefined>(initialDoc);
    const [contacts, setContacts] = useState<ContactPoint[]>(initialContacts);
    const [editing, setEditing] = useState(false);

    // Deep mode fields — initialized from doc, auto-select first contact if not already linked
    const [dobOnDoc, setDobOnDoc] = useState(initialDoc?.dobOnDoc || "");
    const [expiryDate, setExpiryDate] = useState(initialDoc?.expiryDate || "");
    const [issueDate, setIssueDate] = useState(initialDoc?.issueDate || "");
    const [placeOfIssue, setPlaceOfIssue] = useState(initialDoc?.placeOfIssue || "");
    const [linkedMobileId, setLinkedMobileId] = useState(initialDoc?.linkedMobileId || (initialMobiles.length > 0 ? initialMobiles[0].id : ""));
    const [linkedEmailId, setLinkedEmailId] = useState(initialDoc?.linkedEmailId || (initialEmails.length > 0 ? initialEmails[0].id : ""));
    const [notes, setNotes] = useState(initialDoc?.notes || "");
    const [verification, setVerification] = useState(initialDoc?.verificationStatus || "not_verified");
    const [newMobile, setNewMobile] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [saved, setSaved] = useState(false);
    const [dateError, setDateError] = useState("");
    const [dateWarning, setDateWarning] = useState("");
    const [acknowledgedDateWarning, setAcknowledgedDateWarning] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    if (!doc) {
        return (
            <div className="flex flex-col min-h-screen p-6 items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
                <p className="relative z-10 text-white/40">Document not found.</p>
                <button onClick={() => router.push("/identity")} className="relative z-10 text-amber-400 text-sm mt-3">Back to Vault</button>
            </div>
        );
    }

    const links = IdentityStore.getLinksForDoc(docId);
    const strength = calcSealStrength(doc, links);

    const handleAddMobile = () => {
        if (!newMobile.trim()) return;
        const cp = IdentityStore.addContact("mobile", newMobile.trim());
        setLinkedMobileId(cp.id);
        setNewMobile("");
        setContacts(IdentityStore.getContacts());
    };

    const handleAddEmail = () => {
        if (!newEmail.trim()) return;
        const cp = IdentityStore.addContact("email", newEmail.trim());
        setLinkedEmailId(cp.id);
        setNewEmail("");
        setContacts(IdentityStore.getContacts());
    };

    const foundationDob = OnboardingStore.get().dob;

    const handleSave = () => {
        let errorMsg = "";
        let warningMsg = "";

        // Date validations
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (issueDate) {
            const iDate = new Date(issueDate);
            iDate.setHours(0,0,0,0);
            if (iDate > today) {
                errorMsg = "Issuance date cannot be a future date.";
            } else if (foundationDob && iDate < new Date(foundationDob)) {
                errorMsg = "Issuance date cannot be before your birthdate.";
            }
        }

        if (expiryDate && !errorMsg) {
            const eDate = new Date(expiryDate);
            eDate.setHours(0,0,0,0);
            if (foundationDob && eDate < new Date(foundationDob)) {
                errorMsg = "Expiry date cannot be before your birthdate.";
            } else if (eDate < today) {
                warningMsg = "This document appears to be expired. Please review before proceeding.";
            }
        }

        if (issueDate && expiryDate && !errorMsg) {
            const iDate = new Date(issueDate);
            const eDate = new Date(expiryDate);
            if (iDate > eDate) {
                errorMsg = "Issue date cannot be after expiry date.";
            }
        }

        if (errorMsg) {
            setDateError(errorMsg);
            setDateWarning("");
            return;
        }

        if (warningMsg && !acknowledgedDateWarning) {
            setDateWarning(warningMsg);
            setAcknowledgedDateWarning(true);
            return;
        }

        setDateError("");
        setDateWarning("");
        IdentityStore.updateDoc(docId, {
            dobOnDoc: dobOnDoc || undefined,
            expiryDate: expiryDate || undefined,
            issueDate: issueDate || undefined,
            placeOfIssue: placeOfIssue || undefined,
            linkedMobileId: linkedMobileId || undefined,
            linkedEmailId: linkedEmailId || undefined,
            notes: notes || undefined,
            verificationStatus: verification as IdentityDoc["verificationStatus"],
            verifiedDate: verification !== "not_verified" ? new Date().toISOString().split("T")[0] : undefined,
        });
        setDoc(IdentityStore.getDoc(docId));
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleFileUploaded = (fileId: string) => {
        IdentityStore.updateDoc(docId, { vaultFileId: fileId });
        setDoc(IdentityStore.getDoc(docId));
    };

    const storageLabel = doc.storageMode === "cloud" ? "Backed up (Encrypted)" : doc.storageMode === "folder" ? "Stored in Selected Folder" : "Stored in Local Vault";
    const mobiles = contacts.filter(c => c.type === "mobile");
    const emails = contacts.filter(c => c.type === "email");

    return (
        <div className="flex flex-col min-h-screen p-6 pb-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <div className="flex items-center gap-3 pt-8 mb-6">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0">
                        <ArrowLeft className="w-4 h-4 text-white/60" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold text-white">{doc.docType.toUpperCase()} Details</h1>
                        <p className="text-xs text-white/35 mt-0.5">{IdentityStore.maskDocNumber(doc.docNumber, doc.docType)}</p>
                    </div>
                    <SealStrengthRing percentage={strength} size={48} label="Seal" />
                </div>

                {saved && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3 mb-4 text-center text-sm text-emerald-400">
                        ✔ Seal Strength Updated
                    </motion.div>
                )}

                {/* Status cards */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-white/30 uppercase">Storage</p>
                        <p className="text-xs text-white/60 mt-1">{storageLabel}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-white/30 uppercase">Links</p>
                        <p className="text-xs text-white/60 mt-1">{links.length}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-white/30 uppercase">Verified</p>
                        <p className={`text-xs mt-1 ${doc.verificationStatus !== "not_verified" ? "text-emerald-400" : "text-white/40"}`}>
                            {doc.verificationStatus !== "not_verified" ? "Yes" : "No"}
                        </p>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                    <button onClick={() => router.push(`/identity/links/add?docId=${docId}`)} className="bg-white/5 border border-white/10 rounded-xl py-3 flex flex-col items-center gap-1 hover:border-amber-400/30 transition-colors">
                        <Link2 className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] text-white/40">Add Link</span>
                    </button>
                    <button onClick={() => router.push("/identity/renewals")} className="bg-white/5 border border-white/10 rounded-xl py-3 flex flex-col items-center gap-1 hover:border-amber-400/30 transition-colors">
                        <Bell className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] text-white/40">Reminder</span>
                    </button>
                    <button onClick={() => setEditing(true)} className="bg-white/5 border border-white/10 rounded-xl py-3 flex flex-col items-center gap-1 hover:border-amber-400/30 transition-colors">
                        <Edit3 className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] text-white/40">Edit</span>
                    </button>
                </div>

                {/* Deep Mode edit form */}
                <div className="flex-1 space-y-4 overflow-y-auto">
                    <p className="text-xs text-white/35 uppercase tracking-wider">Improve Document Strength</p>

                    {/* Upload if not uploaded */}
                    {!doc.vaultFileId && (
                        <div className="space-y-1">
                            <label className="text-xs text-white/40">Upload File</label>
                            <FileUploader folder="identity" label="Upload Document" onUploaded={handleFileUploaded} />
                        </div>
                    )}

                    {/* Deep fields */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[11px] text-white/70">DOB on Doc</label>
                            <input type="date" value={dobOnDoc} onChange={e => setDobOnDoc(e.target.value)} disabled={!editing}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white disabled:opacity-50 focus:outline-none focus:border-amber-400/60" />
                            {foundationDob && dobOnDoc && foundationDob !== dobOnDoc && (
                                <p className="text-[10px] text-amber-400 mt-1">Differs from profile DOB ({foundationDob}).</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] text-white/70">Expiry Date</label>
                            <input type="date" value={expiryDate} onChange={e => {
                                setExpiryDate(e.target.value);
                                setAcknowledgedDateWarning(false);
                                setDateWarning("");
                            }} disabled={!editing}
                                className={`w-full bg-white/10 border rounded-xl px-3 py-2.5 text-sm text-white disabled:opacity-50 focus:outline-none focus:border-amber-400/60 ${dateError && dateError.includes("Expiry") ? "border-red-500/50" : "border-white/20"}`} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] text-white/70">Issue Date</label>
                            <input type="date" value={issueDate} onChange={e => {
                                setIssueDate(e.target.value);
                            }} disabled={!editing}
                                className={`w-full bg-white/10 border rounded-xl px-3 py-2.5 text-sm text-white disabled:opacity-50 focus:outline-none focus:border-amber-400/60 ${dateError && dateError.includes("Issue") ? "border-red-500/50" : "border-white/20"}`} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] text-white/70">Place of Issue</label>
                            <input type="text" value={placeOfIssue} onChange={e => setPlaceOfIssue(e.target.value)} disabled={!editing} placeholder="City"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/40 disabled:opacity-50 focus:outline-none focus:border-amber-400/60" />
                        </div>
                    </div>

                    {/* Date validation messages */}
                    {dateError && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 flex items-center gap-2">
                            <span className="text-xs text-red-400">⚠ {dateError}</span>
                        </div>
                    )}
                    {dateWarning && !dateError && (
                        <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-2.5 flex flex-col gap-1">
                            <span className="text-xs text-amber-400">⚠ {dateWarning}</span>
                            <span className="text-[10px] text-amber-400/60">Tap "Save Document Details" again to proceed.</span>
                        </div>
                    )}

                    {/* Linked Mobile */}
                    <div className="space-y-2">
                        <label className="text-xs text-white/40">Linked Mobile</label>
                        <select value={linkedMobileId} onChange={e => setLinkedMobileId(e.target.value)} disabled={!editing}
                            className="w-full bg-white/6 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white disabled:opacity-40 focus:outline-none">
                            <option value="">Select mobile</option>
                            {mobiles.map(c => <option key={c.id} value={c.id}>{c.value} {c.label ? `(${c.label})` : ""}</option>)}
                        </select>
                        {editing && (
                            <div className="flex gap-2">
                                <input type="tel" placeholder="Add different mobile" value={newMobile} onChange={e => setNewMobile(e.target.value)}
                                    className="flex-1 bg-white/6 border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-400/60" />
                                <button onClick={handleAddMobile} className="px-3 py-2 bg-amber-400/15 border border-amber-400/30 rounded-xl text-xs text-amber-400">Add</button>
                            </div>
                        )}
                    </div>

                    {/* Linked Email */}
                    <div className="space-y-2">
                        <label className="text-xs text-white/40">Linked Email</label>
                        <select value={linkedEmailId} onChange={e => setLinkedEmailId(e.target.value)} disabled={!editing}
                            className="w-full bg-white/6 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white disabled:opacity-40 focus:outline-none">
                            <option value="">Select email</option>
                            {emails.map(c => <option key={c.id} value={c.id}>{c.value} {c.label ? `(${c.label})` : ""}</option>)}
                        </select>
                        {editing && (
                            <div className="flex gap-2">
                                <input type="email" placeholder="Add different email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                                    className="flex-1 bg-white/6 border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-400/60" />
                                <button onClick={handleAddEmail} className="px-3 py-2 bg-amber-400/15 border border-amber-400/30 rounded-xl text-xs text-amber-400">Add</button>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                        <label className="text-xs text-white/40">Notes</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} disabled={!editing} rows={2} placeholder="Optional notes"
                            className="w-full bg-white/6 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 disabled:opacity-40 focus:outline-none focus:border-amber-400/60 resize-none" />
                    </div>

                    {/* Verification */}
                    <div className="space-y-2">
                        <label className="text-xs text-white/40">Verification Status</label>
                        <div className="flex flex-wrap gap-2">
                            {VERIFICATION_OPTIONS.map(opt => (
                                <button key={opt.value} onClick={() => editing && setVerification(opt.value as typeof verification)}
                                    className={`px-3 py-2 rounded-xl border text-xs transition-all ${verification === opt.value
                                        ? "bg-amber-400/15 border-amber-400 text-amber-400"
                                        : "bg-white/5 border-white/10 text-white/40"
                                        } ${!editing ? "opacity-40 cursor-default" : "hover:border-white/25"}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        {doc.verifiedDate && <p className="text-[10px] text-white/25">Last reviewed: {doc.verifiedDate}</p>}
                    </div>
                </div>

                {/* CTA */}
                <div className="pb-4 pt-4">
                    {editing ? (
                        <button onClick={handleSave} className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm hover:bg-amber-300 transition-colors">
                            Save Improvements
                        </button>
                    ) : (
                        <button onClick={() => setEditing(true)} className="w-full bg-white/8 border border-white/15 text-white/70 py-4 rounded-xl text-sm hover:bg-white/12 transition-colors">
                            Edit Details
                        </button>
                    )}
                    {/* Delete Document */}
                    <button onClick={() => setShowDeleteModal(true)}
                        className="w-full mt-3 text-center text-xs text-red-400/50 hover:text-red-400 py-2 transition-colors">
                        🗑️ Delete this document
                    </button>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setShowDeleteModal(false)}>
                        <div className="bg-slate-900 border border-white/15 rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                            <Trash2 className="w-8 h-8 text-red-400 mx-auto mb-3" />
                            <h2 className="text-white font-semibold text-center mb-1">Delete Document?</h2>
                            <p className="text-xs text-white/35 text-center mb-4">This will permanently remove the {doc.docType.toUpperCase()} document and all its links from your vault.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-white/50">Cancel</button>
                                <button onClick={() => { IdentityStore.deleteDoc(docId); router.push("/identity"); }}
                                    className="flex-1 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-sm text-red-400 font-medium">Delete</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Link2, Plus } from "lucide-react";
import { IdentityStore, DocType } from "@/lib/identityStore";

const SERVICE_EMOJIS: Record<string, string> = {
    bank: "🏦", tax: "📋", insurance: "🛡️", investment: "📈", utility: "⚡", other: "📎",
};

export default function LinksListPage() {
    const router = useRouter();
    const links = IdentityStore.getLinks();
    const docs = IdentityStore.getDocs();
    const contacts = IdentityStore.getContacts();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [toast, setToast] = useState("");

    // Group links by document
    const groupedByDoc: Record<string, typeof links> = {};
    for (const link of links) {
        if (!groupedByDoc[link.docId]) groupedByDoc[link.docId] = [];
        groupedByDoc[link.docId].push(link);
    }

    const getDocLabel = (docId: string) => {
        const doc = docs.find(d => d.id === docId);
        if (!doc) return "Unknown";
        return `${doc.docType.toUpperCase()} — ${IdentityStore.maskDocNumber(doc.docNumber, doc.docType as DocType)}`;
    };

    const getContactValue = (cpId: string) => {
        const cp = contacts.find(c => c.id === cpId);
        return cp ? `${cp.type === "mobile" ? "📱" : "📧"} ${cp.value}` : "—";
    };

    const handleDelete = (linkId: string) => {
        IdentityStore.deleteLink(linkId);
        setDeleteId(null);
        setToast("Link removed");
        setTimeout(() => setToast(""), 2000);
    };

    const health = IdentityStore.getConfidence();

    return (
        <div className="flex flex-col min-h-screen p-6 pb-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <div className="flex items-center justify-between pt-8 mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0">
                            <ArrowLeft className="w-4 h-4 text-white/60" />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold text-white">Identity Links</h1>
                            <p className="text-xs text-white/35 mt-0.5">
                                {links.length > 0 ? `${links.length} link${links.length > 1 ? "s" : ""} • Health ${health}%` : "No links created yet"}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => router.push("/identity/links/add")}
                        className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-amber-400" />
                    </button>
                </div>

                {toast && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3 mb-4 text-center text-sm text-emerald-400">
                        ✔ {toast}
                    </div>
                )}

                <div className="flex-1 space-y-5">
                    {links.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Link2 className="w-10 h-10 text-white/10 mb-3" />
                            <p className="text-sm text-white/30 mb-1">No links yet</p>
                            <p className="text-xs text-white/20 text-center mb-4">Link your documents to the services that use them.</p>
                            <button onClick={() => router.push("/identity/links/add")}
                                className="bg-amber-400 text-black font-semibold px-6 py-2.5 rounded-xl text-sm">
                                Create First Link
                            </button>
                        </div>
                    ) : (
                        Object.entries(groupedByDoc).map(([docId, docLinks]) => (
                            <div key={docId} className="space-y-2">
                                <p className="text-xs text-amber-400/70 uppercase tracking-wider">{getDocLabel(docId)}</p>
                                {docLinks.map(link => (
                                    <div key={link.id} className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                                        <span className="text-lg">{SERVICE_EMOJIS[link.serviceType] || "📎"}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white font-medium truncate">{link.serviceName}</p>
                                            <p className="text-xs text-white/35 mt-0.5">{getContactValue(link.contactPointId)}</p>
                                        </div>
                                        <button onClick={() => setDeleteId(link.id)}
                                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/15 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5 text-white/25 hover:text-red-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>

                {/* Delete confirmation */}
                {deleteId && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setDeleteId(null)}>
                        <div className="bg-slate-900 border border-white/15 rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                            <h2 className="text-white font-semibold mb-1">Remove Link?</h2>
                            <p className="text-xs text-white/35 mb-4">This will remove the connection between your document and the service.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteId(null)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-white/50">Cancel</button>
                                <button onClick={() => handleDelete(deleteId)}
                                    className="flex-1 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-sm text-red-400 font-medium">Remove</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

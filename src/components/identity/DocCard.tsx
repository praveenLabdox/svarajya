"use client";

import { useRouter } from "next/navigation";
import { CreditCard, FileText, Plane, Car, Vote, MoreHorizontal } from "lucide-react";
import { IdentityStore, DocType, calcSealStrength } from "@/lib/identityStore";

const DOC_ICONS: Record<DocType, React.ReactNode> = {
    aadhaar: <CreditCard className="w-4 h-4" />,
    pan: <FileText className="w-4 h-4" />,
    passport: <Plane className="w-4 h-4" />,
    dl: <Car className="w-4 h-4" />,
    voter: <Vote className="w-4 h-4" />,
    other: <MoreHorizontal className="w-4 h-4" />,
};

interface DocCardProps {
    docId: string;
}

export function DocCard({ docId }: DocCardProps) {
    const router = useRouter();
    const doc = IdentityStore.getDoc(docId);
    if (!doc) return null;

    const links = IdentityStore.getLinksForDoc(docId);
    const strength = calcSealStrength(doc, links);

    const strengthColor = strength >= 80 ? "text-emerald-400" : strength >= 40 ? "text-amber-400" : "text-red-400";

    return (
        <button
            onClick={() => router.push(`/identity/doc/${docId}`)}
            className="w-full text-left bg-white/5 border border-white/10 hover:border-amber-400/30 rounded-xl p-3.5 transition-all"
        >
            <div className="flex items-center gap-3">
                <div className="text-amber-400 shrink-0">{DOC_ICONS[doc.docType]}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">{doc.docType.toUpperCase()}</p>
                        <span className={`text-xs font-semibold ${strengthColor}`}>{strength}%</span>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5 truncate">{IdentityStore.maskDocNumber(doc.docNumber, doc.docType)}</p>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-white/25">{doc.nameOnDoc}</span>
                        {links.length > 0 && <span className="text-[10px] text-amber-400/60">{links.length} link{links.length > 1 ? "s" : ""}</span>}
                        {doc.verificationStatus !== "not_verified" && <span className="text-[10px] text-emerald-400/70">✓ Verified</span>}
                    </div>
                </div>
            </div>
        </button>
    );
}

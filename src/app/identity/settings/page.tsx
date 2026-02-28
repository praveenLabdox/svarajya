"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, HardDrive, FolderOpen, Cloud, CheckCircle2 } from "lucide-react";
import { IdentityStore } from "@/lib/identityStore";

const MODES = [
    { id: "local", label: "Local Vault (This Browser)", desc: "Securely stored in your browser. No external access.", icon: <HardDrive className="w-5 h-5" />, recommended: true },
    { id: "folder", label: "Local Folder Vault", desc: "Choose a folder on your device for file storage. Chrome/Edge only.", icon: <FolderOpen className="w-5 h-5" />, recommended: false },
    { id: "cloud", label: "Encrypted Cloud Backup", desc: "Optional. Files are encrypted before upload.", icon: <Cloud className="w-5 h-5" />, recommended: false },
] as const;

export default function VaultSettings() {
    const router = useRouter();
    const [mode, setMode] = useState<"local" | "folder" | "cloud">(IdentityStore.getStorageMode());
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        IdentityStore.setStorageMode(mode);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

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
                        <h1 className="text-lg font-semibold text-white">Your Vault, Your Control</h1>
                        <p className="text-xs text-white/35 mt-0.5">Choose how your documents are stored.</p>
                    </div>
                </div>

                {saved && (
                    <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3 mb-4 text-center text-sm text-emerald-400">
                        ✔ Preferences Updated Successfully
                    </div>
                )}

                <div className="flex-1 space-y-5">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Default Storage Location</p>

                    <div className="space-y-3">
                        {MODES.map(m => (
                            <button key={m.id} onClick={() => setMode(m.id)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${mode === m.id ? "bg-amber-400/10 border-amber-400" : "bg-white/5 border-white/10 hover:border-white/25"
                                    }`}>
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 ${mode === m.id ? "text-amber-400" : "text-white/30"}`}>{m.icon}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm font-medium ${mode === m.id ? "text-amber-400" : "text-white/70"}`}>{m.label}</p>
                                            {m.recommended && <span className="text-[9px] bg-amber-400/15 text-amber-400 px-1.5 py-0.5 rounded uppercase">Recommended</span>}
                                        </div>
                                        <p className="text-xs text-white/35 mt-1">{m.desc}</p>
                                    </div>
                                    {mode === m.id && <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Trust bullets */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Our Promise</p>
                        {["We don't read SMS", "We don't scrape banks", "Your files stay with you unless you enable backup"].map((line, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40 shrink-0" />
                                <p className="text-xs text-white/45">{line}</p>
                            </div>
                        ))}
                    </div>

                    {mode === "folder" && (
                        <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl p-3">
                            <p className="text-xs text-amber-400/80">⚠ Local Folder Vault requires Chrome or Edge. Safari is not supported.</p>
                        </div>
                    )}

                    {mode === "cloud" && (
                        <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl p-3">
                            <p className="text-xs text-amber-400/80">🔐 Cloud backup encrypts files before upload. We cannot read your files without your key.</p>
                        </div>
                    )}
                </div>

                <div className="pb-4 pt-4">
                    <button onClick={handleSave} className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm hover:bg-amber-300 transition-colors">
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
}

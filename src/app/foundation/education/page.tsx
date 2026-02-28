"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { BookOpen, ShieldAlert, CheckCircle2, ArrowLeft, Upload, Plus, GraduationCap } from "lucide-react";
import { FileUploader } from "@/components/vault/FileUploader";
import { VideoTutorialPlaceholder } from "@/components/ui/VideoTutorialPlaceholder";

interface EducationEntry {
    degree: string;
    institution: string;
    year: string;
    specialization: string;
    hasLoan: boolean;
}

const DEGREE_OPTIONS = [
    "10th Standard", "12th Standard", "Diploma",
    "Bachelor's (B.A / B.Sc / B.Com)", "Bachelor's (B.Tech / B.E.)",
    "Bachelor's (BBA / BCA)", "Master's (M.A / M.Sc / M.Com)",
    "Master's (M.Tech / MBA)", "PhD / Doctorate", "Professional (CA / CS / CMA)",
    "Professional (MBBS / MD)", "Professional (LLB / LLM)", "Other",
];

export default function EducationPage() {
    const router = useRouter();
    const [entries, setEntries] = useState<EducationEntry[]>([]);
    const [showForm, setShowForm] = useState(entries.length === 0);
    const [degree, setDegree] = useState("");
    const [institution, setInstitution] = useState("");
    const [year, setYear] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [hasLoan, setHasLoan] = useState(false);
    const [uploadedCerts, setUploadedCerts] = useState<string[]>([]);

    const handleAddEntry = () => {
        if (!degree || !institution) return;
        const entry: EducationEntry = { degree, institution, year, specialization, hasLoan };
        setEntries([...entries, entry]);
        // Reset form
        setDegree("");
        setInstitution("");
        setYear("");
        setSpecialization("");
        setHasLoan(false);
        setShowForm(false);
    };

    const handleFinish = () => {
        console.log("Education saved:", entries, "Certificates:", uploadedCerts);
        router.push("/dashboard");
    };

    const anyLoan = entries.some(e => e.hasLoan);

    return (
        <div className="flex flex-col min-h-screen relative p-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-3 pt-8 mb-4">
                <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center shrink-0">
                    <ArrowLeft className="w-4 h-4 text-white/60" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-white">Education & Qualifications</h1>
                    <p className="text-xs text-white/35 mt-0.5">Add your degrees, diplomas & certificates</p>
                </div>
            </div>

            {/* YouTube Tutorial */}
            <div className="mb-4">
                <VideoTutorialPlaceholder youtubeId="KNWL0uda_OA" label="Why education matters for your financial profile" />
            </div>

            {/* Guide */}
            <div className="bg-[var(--color-rajya-accent)]/8 border border-[var(--color-rajya-accent)]/20 rounded-xl p-3 mb-5">
                <p className="text-xs text-[var(--color-rajya-muted)]">
                    💡 Your education determines earning potential and links to any student loans. Add each degree separately — you can upload certificates too.
                </p>
            </div>

            {/* Existing entries */}
            {entries.length > 0 && (
                <div className="space-y-3 mb-5">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">Your Qualifications ({entries.length})</p>
                    {entries.map((e, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <GraduationCap className="w-4 h-4 text-[var(--color-rajya-accent)]" />
                                <p className="text-sm font-medium text-[var(--color-rajya-text)]">{e.degree}</p>
                            </div>
                            <p className="text-xs text-[var(--color-rajya-muted)]">{e.institution}{e.year ? ` • ${e.year}` : ""}</p>
                            {e.specialization && <p className="text-[10px] text-[var(--color-rajya-muted)]/60 mt-0.5">{e.specialization}</p>}
                            {e.hasLoan && (
                                <span className="mt-2 inline-block text-[10px] bg-[var(--color-rajya-danger)]/10 text-[var(--color-rajya-danger)] border border-[var(--color-rajya-danger)]/20 px-2 py-0.5 rounded-full">
                                    ⚠ Education Loan Active
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add form */}
            <AnimatePresence mode="wait">
                {showForm ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4 mb-6"
                    >
                        <p className="text-xs text-white/40 uppercase tracking-wider">Add a Qualification</p>

                        {/* Degree picker */}
                        <div>
                            <label className="text-xs text-[var(--color-rajya-muted)] mb-1 block">Degree / Certificate *</label>
                            <select
                                value={degree}
                                onChange={e => setDegree(e.target.value)}
                                className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-[var(--color-rajya-text)] text-sm focus:border-[var(--color-rajya-accent)]/50 focus:outline-none appearance-none"
                            >
                                <option value="">Select degree...</option>
                                {DEGREE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        {/* Institution */}
                        <div>
                            <label className="text-xs text-[var(--color-rajya-muted)] mb-1 block">Institution / University *</label>
                            <input
                                type="text"
                                value={institution}
                                onChange={e => setInstitution(e.target.value)}
                                placeholder="e.g. IIT Delhi, Mumbai University"
                                className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-[var(--color-rajya-text)] text-sm focus:border-[var(--color-rajya-accent)]/50 focus:outline-none placeholder-white/20"
                            />
                        </div>

                        {/* Year & Specialization */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-[var(--color-rajya-muted)] mb-1 block">Year</label>
                                <input
                                    type="text"
                                    value={year}
                                    onChange={e => setYear(e.target.value)}
                                    placeholder="e.g. 2020"
                                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-[var(--color-rajya-text)] text-sm focus:border-[var(--color-rajya-accent)]/50 focus:outline-none placeholder-white/20"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-[var(--color-rajya-muted)] mb-1 block">Specialization</label>
                                <input
                                    type="text"
                                    value={specialization}
                                    onChange={e => setSpecialization(e.target.value)}
                                    placeholder="e.g. Computer Science"
                                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-[var(--color-rajya-text)] text-sm focus:border-[var(--color-rajya-accent)]/50 focus:outline-none placeholder-white/20"
                                />
                            </div>
                        </div>

                        {/* Education loan toggle */}
                        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
                            <div>
                                <p className="text-sm text-[var(--color-rajya-text)]">Education Loan?</p>
                                <p className="text-[10px] text-[var(--color-rajya-muted)]">Is there an active loan for this degree?</p>
                            </div>
                            <button
                                onClick={() => setHasLoan(!hasLoan)}
                                className={`w-12 h-7 rounded-full border transition-colors flex items-center px-0.5 ${hasLoan ? "bg-[var(--color-rajya-danger)] border-[var(--color-rajya-danger)]" : "bg-white/10 border-white/20"}`}
                            >
                                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${hasLoan ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                        </div>

                        {/* Certificate upload */}
                        <div className="bg-[var(--color-rajya-card)] border border-[var(--color-rajya-accent)]/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Upload className="w-4 h-4 text-[var(--color-rajya-accent)]" />
                                <p className="text-sm font-medium text-[var(--color-rajya-text)]">Upload Certificate (Optional)</p>
                            </div>
                            <p className="text-[10px] text-[var(--color-rajya-muted)] mb-3">Upload your degree/diploma certificate. Saved securely in Nidhi Vault.</p>
                            <FileUploader
                                folder="education"
                                label="Upload certificate"
                                onUploaded={(url) => setUploadedCerts([...uploadedCerts, url || "cert"])}
                            />
                        </div>

                        {/* Save entry */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleAddEntry}
                                disabled={!degree || !institution}
                                className="bg-[var(--color-rajya-accent)] text-black font-semibold py-3 rounded-xl text-sm disabled:opacity-40"
                            >
                                Save Qualification
                            </button>
                            {entries.length > 0 && (
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="bg-white/5 border border-white/10 text-[var(--color-rajya-text)] py-3 rounded-xl text-sm"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="actions"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3 mb-6"
                    >
                        {/* Add another qualification */}
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full bg-white/5 border border-dashed border-white/20 rounded-xl p-4 flex items-center justify-center gap-2 text-sm text-[var(--color-rajya-muted)] hover:border-[var(--color-rajya-accent)]/40 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Another Qualification
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loan alert */}
            {anyLoan && (
                <div className="bg-[var(--color-rajya-danger)]/10 border border-[var(--color-rajya-danger)]/30 rounded-xl p-4 flex items-start gap-3 mb-5">
                    <ShieldAlert className="w-5 h-5 text-[var(--color-rajya-danger)] shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-[var(--color-rajya-danger)] mb-1">Education Loan Detected</p>
                        <p className="text-xs text-[var(--color-rajya-danger)]/80">
                            This will be tracked in your Rin (Debt) module. Make sure to record EMI details there.
                        </p>
                    </div>
                </div>
            )}

            {/* Finish button */}
            {entries.length > 0 && !showForm && (
                <button
                    onClick={handleFinish}
                    className="w-full bg-[var(--color-rajya-accent)] text-black py-4 rounded-xl font-semibold text-sm mt-auto"
                >
                    Save & Continue to Dashboard
                </button>
            )}
        </div>
    );
}

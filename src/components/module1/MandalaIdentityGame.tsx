"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, User } from "lucide-react";
import Image from "next/image";

// Mock OTP for dev/test phase
const MOCK_OTP = "1234";
const simulateOTP = () => new Promise(res => setTimeout(res, 1500));

interface MandalaGameProps {
    onComplete: (data: IdentityData) => void;
}

export type IdentityData = {
    fullName: string;
    dob: string;
    gender: string;
    primaryMobile: string;
    secondaryMobile?: string;
    primaryEmail: string;
    recoveryEmail?: string;
    address: string;
    city: string;
    occupationType: string;
    maritalStatus: string;
};

// Sequence of questions to fill the Mandala Ring
const QUESTIONS = [
    { id: 'fullName', label: 'Full Name', type: 'text', required: true },
    { id: 'dob', label: 'Date of Birth', type: 'date', required: true },
    { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other', 'Prefer Not to Say'], required: false },
    { id: 'primaryMobile', label: 'Mobile Number', type: 'tel', required: true, otp: true },
    { id: 'primaryEmail', label: 'Email Address', type: 'email', required: true, otp: true },
    { id: 'city', label: 'City', type: 'text', required: true },
    { id: 'address', label: 'Full Address', type: 'textarea', required: true },
    { id: 'maritalStatus', label: 'Marital Status', type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'], required: true }
];

export function MandalaIdentityGame({ onComplete }: MandalaGameProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<Partial<IdentityData>>({});
    const [inputValue, setInputValue] = useState("");
    const [otpState, setOtpState] = useState<"none" | "sending" | "sent" | "verified">("none");
    const [otpInput, setOtpInput] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const q = QUESTIONS[currentStep];
    const progressPercent = (currentStep / QUESTIONS.length) * 100;

    const handleNext = async () => {
        if (q.required && !inputValue && q.type !== 'select') {
            setErrorMsg("This field is required.");
            return;
        }
        setErrorMsg("");

        // Handle OTP flow if applicable
        if (q.otp && otpState === "none") {
            setOtpState("sending");
            await simulateOTP();
            setOtpState("sent");
            return;
        }

        if (q.otp && otpState === "sent") {
            // In test phase, accept the fixed dummy OTP
            if (otpInput === MOCK_OTP) {
                setOtpState("verified");
                await new Promise(r => setTimeout(r, 800));
                setOtpState("none");
                setOtpInput("");
            } else {
                setErrorMsg(`Invalid code. Enter the 4-digit OTP sent to your ${q.id === 'primaryMobile' ? 'mobile' : 'email'}.`);
                return;
            }
        }

        // Save data and move on
        const newData = { ...data, [q.id]: inputValue };
        setData(newData);
        setInputValue(""); // Reset for next

        if (currentStep < QUESTIONS.length - 1) {
            // Pre-fill next input if it exists in state (for going back/resume logic)
            setInputValue(newData[QUESTIONS[currentStep + 1].id as keyof IdentityData] || "");
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete(newData as IdentityData);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-md mx-auto relative">

            {/* Visual Mandala Ring Progress UI */}
            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                {/* The generated AI artifact as the base */}
                <div className="absolute inset-2 rounded-full overflow-hidden opacity-30 mix-blend-screen mix-blend-lighten">
                    <Image src="/राजमुद्रा.png" alt="Seal" fill className="object-cover" />
                </div>

                {/* SVG Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                        cx="96" cy="96" r="90"
                        className="stroke-white/10"
                        strokeWidth="4"
                        fill="none"
                    />
                    <motion.circle
                        cx="96" cy="96" r="90"
                        className="stroke-[var(--color-rajya-accent)]"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 1000" }}
                        animate={{ strokeDasharray: `${(progressPercent / 100) * 565} 1000` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                </svg>

                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <User className="w-8 h-8 text-[var(--color-rajya-accent)] mb-2" />
                    <span className="text-xs font-display tracking-widest uppercase text-[var(--color-rajya-accent)]">
                        Seal of Identity
                    </span>
                    <span className="text-xs text-[var(--color-rajya-muted)] mt-1">{currentStep}/{QUESTIONS.length}</span>
                </div>
            </div>

            {/* Input Area */}
            <div className="w-full bg-[var(--color-rajya-card)] border border-[var(--color-rajya-accent-dim)] shadow-xl p-6 rounded-2xl relative overflow-hidden">

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep + (otpState === 'sent' ? '-otp' : '')}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <h3 className="text-lg text-[var(--color-rajya-text)] font-medium">
                                {otpState === 'sent' ? `Verify ${q.label}` : q.label}
                            </h3>
                            {!q.required && <span className="text-xs text-[var(--color-rajya-muted)]">(Optional)</span>}
                        </div>

                        {otpState === "sending" ? (
                            <div className="flex justify-center items-center py-4 text-[var(--color-rajya-muted)] text-sm animate-pulse gap-2">
                                <span>Sending OTP...</span>
                            </div>
                        ) : otpState === "sent" ? (
                            <div className="space-y-4">
                                <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Test OTP (Dev Mode)</p>
                                    <p className="text-3xl font-mono font-bold tracking-[0.4em] text-amber-400">{MOCK_OTP}</p>
                                    <p className="text-[10px] text-white/40 mt-1">Use this code to continue</p>
                                </div>
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={otpInput}
                                    onChange={e => setOtpInput(e.target.value)}
                                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-4 text-center tracking-[1em] text-2xl text-[var(--color-rajya-accent)] focus:outline-none focus:border-[var(--color-rajya-accent)] transition-colors"
                                    placeholder="0000"
                                />
                            </div>
                        ) : otpState === "verified" ? (
                            <div className="flex flex-col items-center justify-center py-4 text-[var(--color-rajya-success)]">
                                <ShieldCheck className="w-8 h-8 mb-2" />
                                <span>Verified</span>
                            </div>
                        ) : (
                            // Normal Inputs
                            q.type === 'select' ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {q.options?.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setInputValue(opt)}
                                            className={`py-3 px-2 rounded-lg text-sm border transition-colors ${inputValue === opt
                                                ? 'bg-[var(--color-rajya-accent)]/20 border-[var(--color-rajya-accent)] text-[var(--color-rajya-accent)]'
                                                : 'bg-white/5 border-white/10 text-[var(--color-rajya-text)]'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            ) : q.type === 'textarea' ? (
                                <textarea
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-[var(--color-rajya-text)] focus:outline-none focus:border-[var(--color-rajya-accent)] transition-colors min-h-[100px]"
                                />
                            ) : (
                                <input
                                    type={q.type}
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-4 text-[var(--color-rajya-text)] focus:outline-none focus:border-[var(--color-rajya-accent)] transition-colors"
                                    placeholder={q.type === 'date' ? 'YYYY-MM-DD' : ''}
                                />
                            )
                        )}

                        {errorMsg && (
                            <p className="text-[var(--color-rajya-danger)] text-xs text-center">{errorMsg}</p>
                        )}

                        <button
                            onClick={handleNext}
                            disabled={otpState === 'sending' || otpState === 'verified'}
                            className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm hover:bg-amber-300 transition-colors disabled:opacity-50"
                        >
                            {otpState === 'sent' ? 'Verify OTP' : (currentStep === QUESTIONS.length - 1 ? 'Complete Profile' : 'Continue')}
                        </button>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

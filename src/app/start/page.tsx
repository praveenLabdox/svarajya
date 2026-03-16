"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { MessageSquareOff, Landmark, ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TRUST_ICONS = [
    { icon: <MessageSquareOff className="w-4 h-4" />, label: "No SMS reading" },
    { icon: <Landmark className="w-4 h-4" />, label: "No bank scraping" },
    { icon: <ShieldCheck className="w-4 h-4" />, label: "No ads, ever" },
];

export default function AuthGateway() {
    const router = useRouter();
    const supabase = createClient();
    
    const [mode, setMode] = useState<"splash" | "login" | "signup" | "forgot_password">("splash");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [msg, setMsg] = useState("");

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (mode === "signup") {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (signUpError) throw signUpError;
                // Since this app requires onboarding, immediately log them in
                // Or inform them to check email if confirm_email is required by your Supabase settings
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                router.push("/onboarding");
            } else if (mode === "forgot_password") {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/dashboard`
                });
                if (resetError) throw resetError;
                setError("");
                setMsg("Reset link sent to your email.");
                return;
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                router.push("/dashboard"); // Try redirect to dashboard. Middleware will catch if onboarding is needed
            }
        } catch (err: any) {
            setError(err.message || "Failed to authenticate.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                    scopes: "https://www.googleapis.com/auth/drive.file"
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || "Failed to initialize Google login.");
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen items-center justify-between p-8 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0a1628] to-slate-950 pointer-events-none" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/6 blur-[100px] rounded-full pointer-events-none" />

            {/* Dynamic Content Area */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-sm mt-8">
                <AnimatePresence mode="wait">
                    {mode === "splash" ? (
                        <motion.div
                            key="splash"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center space-y-8 w-full"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.12)]">
                                <span className="text-3xl">⚖️</span>
                            </div>
                            <div className="text-center">
                                <h1 className="font-display text-4xl text-amber-400 leading-none tracking-wide">
                                    Sva-Rajya
                                </h1>
                                <p className="text-white/45 text-sm mt-2 tracking-wide">
                                    Your financial command centre.
                                </p>
                            </div>
                            <div className="w-full space-y-3 pt-6">
                                <button
                                    onClick={() => setMode("signup")}
                                    className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    Build Your Rajya <ArrowRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setMode("login")}
                                    className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-xl text-sm hover:bg-white/10 transition-colors"
                                >
                                    Enter Existing Rajya
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="authForm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="w-full flex flex-col items-center"
                        >
                            <div className="w-12 h-12 mb-6 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.1)]">
                                <span className="text-xl">⚖️</span>
                            </div>
                            
                            <h2 className="text-2xl font-semibold text-white mb-2">
                                {mode === "signup" ? "Begin Creation" : mode === "forgot_password" ? "Recover Password" : "Welcome Back"}
                            </h2>
                            <p className="text-sm text-white/40 mb-8 text-center px-4">
                                {mode === "signup" 
                                    ? "Secure your identity to access the kingdom." 
                                    : mode === "forgot_password" 
                                        ? "Enter your email to receive a password reset link." 
                                        : "Enter your credentials to regain command."}
                            </p>

                            <form onSubmit={handleAuth} className="w-full space-y-4">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                            <Mail className="w-4 h-4 text-white/30" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Identity (Email)"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm"
                                        />
                                    </div>
                                    {mode !== "forgot_password" && (
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                <Lock className="w-4 h-4 text-white/30" />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Passphrase"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors text-sm"
                                            />
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                                        {error}
                                    </div>
                                )}
                                
                                {msg && (
                                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center">
                                        {msg}
                                    </div>
                                )}

                                {mode === "login" && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => { setMode("forgot_password"); setError(""); setMsg(""); }}
                                            className="text-[10px] text-amber-400/60 hover:text-amber-400 transition-colors uppercase tracking-wider font-semibold"
                                        >
                                            Forgot Passphrase?
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-amber-400 text-black font-semibold py-4 rounded-xl text-sm flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === "signup" ? "Create Kingdom" : mode === "forgot_password" ? "Send Reset Link" : "Unlock Gates")}
                                </button>
                            </form>

                            <div className="w-full flex items-center gap-4 my-6">
                                <div className="h-px bg-white/10 flex-1" />
                                <span className="text-xs text-white/30 font-medium uppercase tracking-wider">Or</span>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                type="button"
                                className="w-full bg-white text-black font-medium py-3.5 rounded-xl text-sm flex items-center justify-center gap-3 transition-colors disabled:opacity-70 hover:bg-slate-200"
                            >
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.86 16.79 15.69 17.57V20.34H19.26C21.35 18.41 22.56 15.58 22.56 12.25Z" fill="#4285F4"/>
                                    <path d="M12 23C14.97 23 17.46 22.01 19.26 20.34L15.69 17.57C14.71 18.23 13.46 18.66 12 18.66C9.18 18.66 6.78 16.75 5.91 14.18H2.21V17.05C4.01 20.64 7.72 23 12 23Z" fill="#34A853"/>
                                    <path d="M5.91 14.18C5.69 13.51 5.56 12.78 5.56 12C5.56 11.22 5.69 10.49 5.91 9.82V6.95H2.21C1.47 8.43 1.04 10.16 1.04 12C1.04 13.84 1.47 15.57 2.21 17.05L5.91 14.18Z" fill="#FBBC05"/>
                                    <path d="M12 5.34C13.62 5.34 15.07 5.9 16.21 6.99L19.34 3.86C17.46 2.1 14.97 1 12 1C7.72 1 4.01 3.36 2.21 6.95L5.91 9.82C6.78 7.25 9.18 5.34 12 5.34Z" fill="#EA4335"/>
                                </svg>
                                Continue with Google
                            </button>

                            <button
                                onClick={() => {
                                    setMode(mode === "signup" ? "login" : "signup");
                                    setError("");
                                    setMsg("");
                                }}
                                className="mt-8 text-xs text-amber-400/60 hover:text-amber-400 transition-colors"
                            >
                                {mode === "signup" ? "Already have a Kingdom? Login instead" : "Need to establish your Rajya? Sign up"}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom trust strip + progress */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="relative z-10 w-full space-y-5"
            >
                {/* 3 Trust icons */}
                <div className="flex items-center justify-center gap-5">
                    {TRUST_ICONS.map((t, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                            <div className="w-8 h-8 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center text-white/40">
                                {t.icon}
                            </div>
                            <span className="text-[9px] text-white/30 text-center leading-tight max-w-[56px]">
                                {t.label}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="text-center text-[10px] text-white/25 mt-3">
                    Local-first cryptography • Zero data brokering
                </p>
            </motion.div>
        </div>
    );
}

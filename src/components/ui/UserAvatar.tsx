"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UserAvatarProps {
    size?: "sm" | "md" | "lg";
    showName?: boolean;
    className?: string;
}

const SIZE_MAP = {
    sm: { img: "w-8 h-8", text: "w-8 h-8 text-xs", font: "text-xs" },
    md: { img: "w-10 h-10", text: "w-10 h-10 text-sm", font: "text-sm" },
    lg: { img: "w-14 h-14", text: "w-14 h-14 text-lg", font: "text-base" },
};

export function UserAvatar({ size = "md", showName = false, className = "" }: UserAvatarProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [fullName, setFullName] = useState<string>("");
    const [initials, setInitials] = useState<string>("?");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Try to get avatar from OAuth metadata (Google, etc.)
                const metaAvatar = user.user_metadata?.avatar_url as string | undefined;
                if (metaAvatar) setAvatarUrl(metaAvatar);

                // Get name from DB profile (most accurate)
                const res = await fetch("/api/profile", { cache: "no-store" });
                if (res.ok) {
                    const profile = await res.json();
                    const name: string = profile?.fullName || user.user_metadata?.full_name || user.email || "";
                    setFullName(name);
                    if (name) {
                        const parts = name.split(" ").filter(Boolean);
                        const computed = parts.length >= 2
                            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                            : name.slice(0, 2).toUpperCase();
                        setInitials(computed);
                    }
                }
            } catch {
                // silently fail — avatar is non-critical
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const s = SIZE_MAP[size];

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Avatar circle */}
            <div className="relative shrink-0">
                {loading ? (
                    <div className={`${s.text} rounded-full bg-white/10 animate-pulse`} />
                ) : avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={avatarUrl}
                        alt={fullName || "User"}
                        className={`${s.img} rounded-full object-cover border-2 border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]`}
                    />
                ) : (
                    <div className={`${s.text} rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-black shadow-[0_0_12px_rgba(251,191,36,0.25)] border-2 border-amber-400/40`}>
                        {initials}
                    </div>
                )}
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[var(--color-rajya-bg)]" />
            </div>

            {/* Name (optional) */}
            {showName && fullName && (
                <div className="min-w-0">
                    <p className={`font-semibold text-[var(--color-rajya-text)] truncate ${s.font}`}>
                        {fullName.split(" ")[0]}
                    </p>
                    <p className="text-[10px] text-amber-400/70 uppercase tracking-widest">Rajya Admin</p>
                </div>
            )}
        </div>
    );
}

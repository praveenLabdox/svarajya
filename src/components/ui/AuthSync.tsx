"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OnboardingStore } from "@/lib/onboardingStore";

const LAST_LOGIN_KEY = "svarajya_last_login";

// Routes where AuthSync should do nothing
const BYPASS_PATHS = ["/", "/start", "/intro"];

export function AuthSync() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Never run on public/cinematic pages
        if (BYPASS_PATHS.includes(pathname)) return;
        // Never interfere while user is mid-onboarding
        if (pathname.startsWith("/onboarding")) return;

        const syncUserData = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) return; // Middleware protects routes anyway

            // --- Step 1: Fetch profile directly from DB (authoritative) ---
            let dbProfile: any = undefined; // undefined means "not fetched yet", null means "confirmed empty"
            try {
                const res = await fetch("/api/profile", { cache: "no-store" });
                if (res.ok) {
                    dbProfile = await res.json();
                    console.log("[AuthSync] DB profile fetched:", dbProfile);
                } else {
                    console.warn("[AuthSync] Profile API returned", res.status);
                    if (res.status === 401) return; // Unauthorized handled by middleware
                    if (res.status >= 500) {
                         console.warn("[AuthSync] Server error, skipping redirect safety gate");
                         return;
                    }
                    dbProfile = null; // Explicit 404/Empty
                }
            } catch (err) {
                console.error("[AuthSync] Failed to fetch profile (network error):", err);
                return; // Network error — don't redirect
            }

            // --- Step 2: Determine if profile is complete enough ---
            // We only proceed IF we have a definitive answer (managed to talk to DB)
            if (dbProfile === undefined) return; 
            
            const hasProfile = dbProfile && typeof dbProfile.fullName === "string" && dbProfile.fullName.trim() !== "";
            
            // --- Step 3: Actionable Policy ---
            // - If on Dashboard: Never redirect away. 
            if (pathname === "/dashboard") return;

            if (hasProfile) {
                // Populate in-memory store from DB data
                await OnboardingStore.hydrate();

                // Track last login
                const now = new Date().toISOString();
                const lastLogin = localStorage.getItem(LAST_LOGIN_KEY);
                localStorage.setItem(LAST_LOGIN_KEY, now);

                // If no previous login on this device → show welcome-back screen
                if (!lastLogin) {
                    router.replace("/onboarding/firstwin?returning=true");
                    return;
                }
            } else {
                // No profile — start onboarding
                console.log("[AuthSync] No profile found, starting onboarding flow");
                const googleName = session.user.user_metadata?.full_name;
                if (googleName) {
                    await OnboardingStore.set({
                        fullName: googleName,
                        email: session.user.email || ""
                    });
                    router.push("/onboarding/dob");
                } else {
                    router.push("/onboarding/name");
                }
            }
        };

        syncUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    return null;
}

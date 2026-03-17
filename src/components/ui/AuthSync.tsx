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
            let dbProfile: Record<string, unknown> | null = null;
            try {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    dbProfile = await res.json();
                    console.log("[AuthSync] DB profile fetched:", dbProfile);
                } else {
                    console.warn("[AuthSync] Profile API returned", res.status);
                }
            } catch (err) {
                console.error("[AuthSync] Failed to fetch profile:", err);
            }

            // --- Step 2: Determine if profile is complete enough ---
            // Only require fullName — the essential anchor. dob & occupation are filled during flow.
            const hasProfile = dbProfile && typeof dbProfile.fullName === "string" && dbProfile.fullName.trim() !== "";
            console.log("[AuthSync] hasProfile:", hasProfile, "| pathname:", pathname);

            if (hasProfile) {
                // Populate in-memory store from DB data
                await OnboardingStore.hydrate();

                // Track last login
                const now = new Date().toISOString();
                const lastLogin = localStorage.getItem(LAST_LOGIN_KEY);
                localStorage.setItem(LAST_LOGIN_KEY, now);

                // If this is a fresh device login (no previous login stored), show welcome-back
                if (!lastLogin && pathname !== "/dashboard") {
                    router.replace("/onboarding/firstwin?returning=true");
                }
                // Otherwise let them stay where they are (dashboard or any protected page)

            } else {
                // --- No profile — start onboarding ---
                console.log("[AuthSync] No profile found, starting onboarding");
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

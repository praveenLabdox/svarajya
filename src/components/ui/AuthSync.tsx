"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OnboardingStore } from "@/lib/onboardingStore";

const LAST_LOGIN_KEY = "svarajya_last_login";

export function AuthSync() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Skip on fully public / cinematic pages
        if (pathname === "/" || pathname === "/start" || pathname === "/intro") return;
        // Don't interfere while the user is mid-onboarding
        if (pathname.startsWith("/onboarding")) return;

        const syncUserData = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) return; // Middleware guards handle this

            // --- Hydrate from DB first (authoritative source) ---
            await OnboardingStore.hydrate();
            const onboardingData = OnboardingStore.get();

            const hasCompletedProfile = !!(
                onboardingData.fullName &&
                onboardingData.dob &&
                onboardingData.occupationType
            );

            if (hasCompletedProfile) {
                // Returning user — record login timestamp and let them proceed normally
                const now = new Date().toISOString();
                const lastLogin = localStorage.getItem(LAST_LOGIN_KEY);
                if (!lastLogin) {
                    // First login on this device but profile exists (e.g. new browser/device)
                    localStorage.setItem(LAST_LOGIN_KEY, now);
                    // Show welcome-back firstwin screen
                    router.replace("/onboarding/firstwin?returning=true");
                } else {
                    // Known device — update timestamp silently, don't disturb navigation
                    localStorage.setItem(LAST_LOGIN_KEY, now);
                }
            } else {
                // New user — no completed DB profile found, start onboarding
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
    }, [pathname, router]);

    return null;
}

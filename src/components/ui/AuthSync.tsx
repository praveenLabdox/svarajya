"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OnboardingStore } from "@/lib/onboardingStore";

export function AuthSync() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Skip sync on completely public pages
        if (pathname === "/" || pathname === "/start") return;

        const syncUserData = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
                const onboardingData = OnboardingStore.get();
                
                // If the user's local store doesn't have a name yet (fresh login or fresh device)
                if (!onboardingData.fullName || onboardingData.fullName.trim() === "") {
                    // Check if Google provided a name
                    const googleName = session.user.user_metadata?.full_name;
                    if (googleName) {
                        OnboardingStore.set({
                            fullName: googleName,
                            email: session.user.email || ""
                        });
                        // Push to onboarding anyway to get occupation/dob
                        if (!pathname.startsWith("/onboarding")) {
                            router.push("/onboarding/dob");
                        }
                    } else {
                        // Not Google, or no name provided, force onboarding
                        if (!pathname.startsWith("/onboarding")) {
                            router.push("/onboarding/name");
                        }
                    }
                }
            } else {
                // Not logged in. Middleware handles auth guards, but we can catch edge cases
            }
        };

        syncUserData();
    }, [pathname, router]);

    return null;
}

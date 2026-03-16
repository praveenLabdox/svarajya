"use client";

import { BottomNav } from "@/components/BottomNav";
import { AlertToast } from "@/components/ui/AlertToast";
import { GlobalTopRightMenu } from "@/components/ui/GlobalTopRightMenu";
import { AuthSync } from "@/components/ui/AuthSync";

export function LayoutClient({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AuthSync />
            <GlobalTopRightMenu />
            <AlertToast />
            {children}
            <BottomNav />
        </>
    );
}

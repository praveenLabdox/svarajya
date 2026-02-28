"use client";

import { BottomNav } from "@/components/BottomNav";
import { AlertToast } from "@/components/ui/AlertToast";

export function LayoutClient({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AlertToast />
            {children}
            <BottomNav />
        </>
    );
}

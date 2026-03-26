"use client";

import { BottomNav } from "@/components/BottomNav";
import { AlertToast } from "@/components/ui/AlertToast";
import { GlobalTopRightMenu } from "@/components/ui/GlobalTopRightMenu";
import { AuthSync } from "@/components/ui/AuthSync";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { DesktopRightPanel } from "@/components/DesktopRightPanel";

export function LayoutClient({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AuthSync />
            <AlertToast />

            {/* Desktop: 3-column layout */}
            <div className="hidden lg:flex min-h-screen w-full">
                <DesktopSidebar />
                <main className="flex-1 min-w-0 overflow-y-auto min-h-screen">
                    {/* Top right menu only needed on desktop — replaced by sidebar on mobile */}
                    <div className="relative">
                        {children}
                    </div>
                </main>
                <DesktopRightPanel />
            </div>

            {/* Mobile: existing layout unchanged */}
            <div className="lg:hidden">
                <GlobalTopRightMenu />
                {children}
                <BottomNav />
            </div>
        </>
    );
}

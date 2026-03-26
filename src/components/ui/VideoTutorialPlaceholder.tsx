"use client";

import { Play, Youtube } from "lucide-react";

interface VideoTutorialPlaceholderProps {
    /** YouTube video ID — e.g. "dQw4w9WgXcQ". Leave empty to show placeholder. */
    youtubeId?: string;
    /** Short label shown below the thumbnail */
    label?: string;
}

export function VideoTutorialPlaceholder({
    youtubeId,
    label = "Watch tutorial",
}: VideoTutorialPlaceholderProps) {
    if (youtubeId) {
        return (
            <a
                href={`https://www.youtube.com/watch?v=${youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl overflow-hidden group border border-white/10 hover:border-white/30 transition-all lg:flex lg:items-center lg:gap-4 lg:p-4 lg:rounded-2xl lg:bg-white/4 lg:hover:bg-white/6"
            >
                {/* Mobile: full-width thumbnail. Desktop: small fixed thumbnail. */}
                <div className="relative lg:w-40 lg:h-24 lg:shrink-0 lg:rounded-xl lg:overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                        alt={label}
                        className="w-full h-full object-cover aspect-video lg:aspect-auto"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                        <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-full bg-red-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 lg:w-4 lg:h-4 text-white fill-white ml-0.5" />
                        </div>
                    </div>
                </div>
                {/* Desktop only: text label next to thumbnail */}
                <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-[var(--color-rajya-text)]">🎓 Tutorial</p>
                    <p className="text-xs text-white/40 mt-0.5">{label}</p>
                    <p className="text-[10px] text-amber-400/60 mt-1.5 uppercase tracking-wider">Click to watch on YouTube →</p>
                </div>
                {/* Mobile only: label overlay (existing behaviour) */}
                <span className="lg:hidden absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-xs font-medium tracking-wide">{label}</span>
            </a>
        );
    }

    // Placeholder state — no video set yet
    return (
        <div className="w-full rounded-xl border border-dashed border-white/15 bg-white/5 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Youtube className="w-6 h-6 text-white/40" />
            </div>
            <div>
                <p className="text-sm text-white/60 font-medium">{label}</p>
                <p className="text-xs text-white/30 mt-0.5">Video tutorial — coming soon</p>
            </div>
        </div>
    );
}

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
                className="block w-full rounded-xl overflow-hidden relative group border border-white/10 hover:border-white/30 transition-colors"
            >
                {/* YouTube auto-generated thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                    alt={label}
                    className="w-full object-cover aspect-video"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 group-hover:bg-black/50 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                    <span className="text-white text-xs font-medium tracking-wide">{label}</span>
                </div>
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

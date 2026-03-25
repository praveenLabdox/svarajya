"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayCircle, X, ExternalLink } from "lucide-react";

interface YouTubeTutorialProps {
    videoId: string;
    title: string;
    description?: string;
    channelName?: string;
}

/**
 * Embedded YouTube tutorial placeholder.
 * Shows a compact card that expands into an iframe on tap.
 * Links out to YouTube for full experience.
 */
export function YouTubeTutorial({ videoId, title, description, channelName }: YouTubeTutorialProps) {
    const [expanded, setExpanded] = useState(false);
    const thumbUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

    if (expanded) {
        return (
            <div className="bg-[var(--color-rajya-card)] border border-[var(--color-rajya-accent)]/20 rounded-xl overflow-hidden">
                {/* Embedded player */}
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    />
                </div>
                <div className="p-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--color-rajya-text)] truncate">{title}</p>
                        {channelName && <p className="text-[10px] text-[var(--color-rajya-muted)]">{channelName}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                        <a
                            href={watchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[var(--color-rajya-accent)] flex items-center gap-1"
                        >
                            <ExternalLink className="w-3 h-3" /> YouTube
                        </a>
                        <button onClick={() => setExpanded(false)} className="p-1 rounded-lg hover:bg-white/10">
                            <X className="w-3.5 h-3.5 text-[var(--color-rajya-muted)]" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setExpanded(true)}
            className="w-full bg-[var(--color-rajya-card)] border border-white/8 rounded-xl p-3 flex items-center gap-3 hover:border-[var(--color-rajya-accent)]/30 transition-colors text-left group"
        >
            {/* Thumbnail */}
            <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0 bg-white/5">
                <Image
                    src={thumbUrl}
                    alt={title}
                    fill
                    sizes="80px"
                    className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                    <PlayCircle className="w-6 h-6 text-white/90" />
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--color-rajya-text)] line-clamp-2">{title}</p>
                {description && <p className="text-[10px] text-[var(--color-rajya-muted)] mt-0.5 line-clamp-1">{description}</p>}
                {channelName && (
                    <p className="text-[9px] text-[var(--color-rajya-accent)] mt-1">▶ {channelName}</p>
                )}
            </div>
        </button>
    );
}

/**
 * A section wrapper for grouping multiple tutorial videos.
 */
export function TutorialSection({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <p className="text-[10px] text-white/30 uppercase tracking-wider flex items-center gap-1.5">
                🎓 {title || "Learn More"}
            </p>
            {children}
        </div>
    );
}

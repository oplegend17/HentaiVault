"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";

// Fallback tags if API is unavailable
const FALLBACK_TAGS = [
  "waifu", "maid", "oppai", "uniform", "selfies", "marin-kitagawa",
  "mori-calliope", "raiden-shogun", "yor-briar", "zero-two",
  "hentai", "ecchi", "ass", "hips", "milf", "paizuri",
  "oral", "anal", "gangbang", "tentacles",
];

interface WaifuTag {
  id: number;
  name: string;
  slug: string;
  description: string;
  isNsfw: boolean;
}

interface Props {
  onTagSelect?: () => void;
}

export default function TagCloud({ onTagSelect }: Props) {
  const { activeTags, addTag } = useStore();
  const [nsfwTags, setNsfwTags]   = useState<string[]>([]);
  const [sfwTags,  setSfwTags]    = useState<string[]>([]);
  const [showNsfw, setShowNsfw]   = useState(true);
  const [loaded,   setLoaded]     = useState(false);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => {
        const all: WaifuTag[] = [
          ...(data?.nsfw  ?? []),
          ...(data?.versatile ?? []),
        ];
        if (all.length === 0) return; // keep fallback

        const nsfw = all.filter((t) => t.isNsfw).map((t) => t.slug);
        const sfw  = all.filter((t) => !t.isNsfw).map((t) => t.slug);
        setNsfwTags(nsfw);
        setSfwTags(sfw);
        setLoaded(true);
      })
      .catch(() => {}); // silently fall back
  }, []);

  const displayTags = loaded
    ? (showNsfw ? nsfwTags : sfwTags)
    : FALLBACK_TAGS;

  const handleTag = (tag: string) => {
    if (!activeTags.includes(tag)) {
      addTag(tag);
      onTagSelect?.();
    }
  };

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <p className="section-label">
          {loaded ? "Waifu.im tags" : "Popular tags"}
        </p>
        {loaded && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowNsfw(true)}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-headline font-bold uppercase tracking-wide transition-all duration-150 active:scale-95"
              style={
                showNsfw
                  ? { background: "rgba(255,141,138,0.15)", color: "#ff8d8a", border: "1px solid rgba(255,141,138,0.3)" }
                  : { background: "rgba(255,255,255,0.04)", color: "#76747b", border: "1px solid rgba(255,255,255,0.07)" }
              }
            >
              NSFW
            </button>
            <button
              onClick={() => setShowNsfw(false)}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-headline font-bold uppercase tracking-wide transition-all duration-150 active:scale-95"
              style={
                !showNsfw
                  ? { background: "rgba(168,140,251,0.15)", color: "#a88cfb", border: "1px solid rgba(168,140,251,0.3)" }
                  : { background: "rgba(255,255,255,0.04)", color: "#76747b", border: "1px solid rgba(255,255,255,0.07)" }
              }
            >
              SFW
            </button>
          </div>
        )}
      </div>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-1.5">
        {displayTags.map((tag) => {
          const active = activeTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => handleTag(tag)}
              disabled={active}
              className="rounded-full px-3 py-1 text-xs font-body transition-all duration-150 active:scale-95 disabled:cursor-default"
              style={
                active
                  ? {
                      background: "rgba(255,141,138,0.15)",
                      color: "#ff8d8a",
                      border: "1px solid rgba(255,141,138,0.35)",
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      color: "#acaab1",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }
              }
            >
              {tag.replace(/-/g, " ")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

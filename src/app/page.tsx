"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Flame, Shuffle, TrendingUp, Zap } from "lucide-react";
import Gallery from "@/components/Gallery";
import SearchBar from "@/components/SearchBar";
import SourceFilter from "@/components/SourceFilter";
import TagFilter from "@/components/TagFilter";
import TagCloud from "@/components/TagCloud";
import { HentaiImage } from "@/types";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";

const FEATURE_PILLS = [
  { icon: TrendingUp, label: "Multi-source", desc: "6 APIs at once" },
  { icon: Zap,        label: "Instant",      desc: "Infinite scroll" },
  { icon: Shuffle,    label: "Random",       desc: "Surprise me" },
];

export default function HomePage() {
  const [images, setImages] = useState<HentaiImage[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { activeSources, activeTags, userProfile } = useStore();
  const router = useRouter();
  const fetchingRef = useRef(false);

  const fetchImages = useCallback(
    async (reset = false) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setLoading(true);
      const currentPage = reset ? 1 : page;

      try {
        const params = new URLSearchParams({
          q: activeTags.join(" "),
          page: String(currentPage),
          limit: "24",
          sources: activeSources.join(","),
          userId: userProfile?.uid || "",
          username: userProfile?.username || "",
        });

        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();

        setImages((prev) => (reset ? data.images : [...prev, ...data.images]));
        setHasMore(data.hasMore);
        setPage(currentPage + 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    [page, activeSources, activeTags]
  );

  // Reload when sources/tags change
  useEffect(() => {
    setPage(1);
    fetchImages(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSources, activeTags]);

  const handleLoadMore = useCallback(() => {
    fetchImages(false);
  }, [fetchImages]);

  return (
    <div className="space-y-8">

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="pt-4 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <Flame
              className="h-8 w-8 text-primary animate-float"
              style={{ filter: "drop-shadow(0 0 12px rgba(255,141,138,0.6))" }}
            />
          </div>
          <h1
            className="font-headline font-extrabold text-4xl sm:text-5xl tracking-tight"
            style={{ background: "linear-gradient(135deg, #ff8d8a 0%, #ff794b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            HentaiVault
          </h1>
        </div>
        <p className="font-body text-sm text-on-surface-variant max-w-md">
          Discover high-quality content from 6 sources in one place. Search, filter, collect.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {FEATURE_PILLS.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Icon className="h-3.5 w-3.5 text-primary" />
              <span className="font-headline font-semibold text-xs text-on-surface">{label}</span>
              <span className="font-body text-xs text-outline">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────── */}
      <div className="space-y-3">
        <SearchBar onSearch={() => { setPage(1); fetchImages(true); }} />
        <SourceFilter />
        <TagFilter />
        <TagCloud onTagSelect={() => { setPage(1); fetchImages(true); }} />
      </div>

      {/* ── Quick actions ────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/random")}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-headline font-semibold transition-all duration-200 active:scale-95 hover:opacity-90"
          style={{ background: "rgba(168,140,251,0.12)", color: "#a88cfb", border: "1px solid rgba(168,140,251,0.25)" }}
        >
          <Shuffle className="h-4 w-4" />
          Random
        </button>

        {images.length > 0 && (
          <span className="text-xs font-body text-outline">
            {images.length} images loaded
          </span>
        )}
      </div>

      {/* ── Gallery ──────────────────────────────────────── */}
      <Gallery
        images={images}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loading={loading}
      />
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { Shuffle, RefreshCw, Sparkles } from "lucide-react";
import Gallery from "@/components/Gallery";
import { HentaiImage } from "@/types";

export default function RandomPage() {
  const [images, setImages] = useState<HentaiImage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRandom = useCallback(
    async (append = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const res = await fetch("/api/random?count=20");
        const data = await res.json();
        setImages((prev) => (append ? [...prev, ...data.images] : data.images));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Shuffle
              className="h-5 w-5 text-secondary"
              style={{ filter: "drop-shadow(0 0 8px rgba(168,140,251,0.5))" }}
            />
            <h1 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">
              Random
            </h1>
          </div>
          <p className="text-sm font-body text-on-surface-variant">
            Instant dopamine hits from random sources
          </p>
        </div>

        {images.length > 0 && (
          <button
            onClick={() => fetchRandom(false)}
            disabled={loading}
            className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-headline font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #a88cfb 0%, #d8caff 100%)",
              color: "#260069",
              boxShadow: "0 10px 20px rgba(168,140,251,0.20)",
            }}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        )}
      </div>

      {/* Empty state */}
      {images.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div
            className="w-24 h-24 flex items-center justify-center rounded-full animate-float"
            style={{
              background: "linear-gradient(135deg, rgba(168,140,251,0.15) 0%, rgba(255,141,138,0.10) 100%)",
              border: "1px solid rgba(168,140,251,0.2)",
            }}
          >
            <Sparkles className="h-10 w-10 text-secondary" />
          </div>
          <div className="text-center">
            <p className="font-headline font-semibold text-on-surface mb-1">Ready when you are</p>
            <p className="text-sm font-body text-on-surface-variant">
              Hit the button to load random images from all sources
            </p>
          </div>
          <button
            onClick={() => fetchRandom(false)}
            className="btn-primary max-w-xs"
          >
            <Shuffle className="h-4 w-4" />
            Load Random Images
          </button>
        </div>
      )}

      {images.length > 0 && (
        <Gallery
          images={images}
          onLoadMore={() => fetchRandom(true)}
          hasMore={true}
          loading={loading}
        />
      )}

      {loading && images.length === 0 && (
        <div className="flex justify-center py-32">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-secondary animate-spin" />
            <span className="text-sm font-body">Fetching random images...</span>
          </div>
        </div>
      )}
    </div>
  );
}

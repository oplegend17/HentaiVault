"use client";

import { useState, useCallback } from "react";
import { HentaiImage } from "@/types";
import ImageCard from "./ImageCard";
import ImageModal from "./ImageModal";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Loader2, ImageOff } from "lucide-react";

interface Props {
  images: HentaiImage[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

export default function Gallery({
  images,
  onLoadMore,
  hasMore = false,
  loading = false,
}: Props) {
  const [selected, setSelected] = useState<HentaiImage | null>(null);

  const handleLoadMore = useCallback(() => {
    if (onLoadMore && !loading) onLoadMore();
  }, [onLoadMore, loading]);

  const sentinelRef = useInfiniteScroll(handleLoadMore, hasMore && !loading);

  if (images.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div
          className="w-20 h-20 flex items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <ImageOff className="h-8 w-8 text-outline" />
        </div>
        <div className="text-center">
          <p className="font-headline font-semibold text-on-surface-variant">No images found</p>
          <p className="text-sm font-body text-outline mt-1">Try a different search or enable more sources</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Masonry grid */}
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-5 space-y-3">
        {images.map((img, i) => (
          <div
            key={img.id}
            className="break-inside-avoid animate-reveal"
            style={{ animationDelay: `${Math.min(i % 10, 9) * 30}ms` }}
          >
            <ImageCard image={img} onClick={setSelected} />
          </div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-body">Loading more...</span>
          </div>
        </div>
      )}

      {/* End of results */}
      {!hasMore && images.length > 0 && !loading && (
        <div className="flex justify-center py-8">
          <span className="section-label">— End of results —</span>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <ImageModal image={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

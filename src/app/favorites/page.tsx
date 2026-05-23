"use client";

import { useState } from "react";
import { Heart, Trash2, BookmarkX } from "lucide-react";
import { useStore } from "@/store/useStore";
import ImageCard from "@/components/ImageCard";
import ImageModal from "@/components/ImageModal";
import { HentaiImage } from "@/types";

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useStore();
  const [selected, setSelected] = useState<HentaiImage | null>(null);

  const clearAll = () => {
    if (confirm("Clear all favorites? This can't be undone.")) {
      favorites.forEach((f) => removeFavorite(f.id));
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Heart
              className="h-5 w-5 text-primary fill-current"
              style={{ filter: "drop-shadow(0 0 8px rgba(255,141,138,0.5))" }}
            />
            <h1 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">
              Favorites
            </h1>
          </div>
          <p className="text-sm font-body text-on-surface-variant">
            {favorites.length > 0
              ? `${favorites.length} saved image${favorites.length !== 1 ? "s" : ""}`
              : "Your saved images appear here"}
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-headline font-semibold transition-all duration-200 active:scale-95"
            style={{ background: "rgba(239,68,68,0.10)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Empty state */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div
            className="w-24 h-24 flex items-center justify-center rounded-full"
            style={{
              background: "rgba(255,141,138,0.06)",
              border: "1px solid rgba(255,141,138,0.12)",
            }}
          >
            <BookmarkX className="h-10 w-10 text-outline" />
          </div>
          <div className="text-center">
            <p className="font-headline font-semibold text-on-surface mb-1">Nothing saved yet</p>
            <p className="text-sm font-body text-on-surface-variant max-w-xs">
              Click the heart icon on any image to save it here. Favorites persist across sessions.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-5 space-y-3">
            {favorites.map((img, i) => (
              <div
                key={img.id}
                className="break-inside-avoid animate-reveal"
                style={{ animationDelay: `${Math.min(i % 10, 9) * 30}ms` }}
              >
                <ImageCard image={img} onClick={setSelected} />
              </div>
            ))}
          </div>

          {/* Footer count */}
          <div className="flex justify-center py-4">
            <span className="section-label">— {favorites.length} saved —</span>
          </div>
        </>
      )}

      {selected && (
        <ImageModal image={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

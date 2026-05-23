"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, Heart, ExternalLink, Tag, Database, Maximize2 } from "lucide-react";
import { HentaiImage } from "@/types";
import { useStore } from "@/store/useStore";

interface Props {
  image: HentaiImage;
  onClose: () => void;
}

const RATING_STYLE: Record<string, React.CSSProperties> = {
  explicit:     { background: "rgba(239,68,68,0.15)",  color: "#fca5a5",  border: "1px solid rgba(239,68,68,0.3)" },
  questionable: { background: "rgba(234,179,8,0.15)",  color: "#fde047",  border: "1px solid rgba(234,179,8,0.3)" },
  safe:         { background: "rgba(34,197,94,0.12)",  color: "#86efac",  border: "1px solid rgba(34,197,94,0.25)" },
};

export default function ImageModal({ image, onClose }: Props) {
  const { isFavorite, addFavorite, removeFavorite, addTag } = useStore();
  const fav = isFavorite(image.id);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(14,14,19,0.92)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden lg:flex-row animate-reveal"
        style={{
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "1.5rem",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150 active:scale-90"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#acaab1", border: "1px solid rgba(255,255,255,0.08)" }}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image panel */}
        <div className="relative flex-1 min-h-[300px] lg:min-h-0 bg-surface-container-low flex items-center justify-center" style={{ borderRadius: "1.5rem 0 0 1.5rem" }}>
          {image.fileType === "video" ? (
            <video
              src={image.videoUrl || image.url}
              poster={image.previewUrl}
              controls
              autoPlay
              loop
              playsInline
              className="w-full h-full max-h-[70vh] object-contain rounded-t-[1.5rem] lg:rounded-l-[1.5rem] lg:rounded-tr-none"
            />
          ) : (
            <Image
              src={image.url}
              alt={image.tags.slice(0, 3).join(", ") || "image"}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 65vw"
              unoptimized
            />
          )}
          {/* Open full size */}
          {image.url && (
            <a
              href={image.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-95"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", color: "#acaab1" }}
              title="Open full size"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex w-full flex-col gap-4 overflow-y-auto p-5 lg:w-72 lg:border-l lg:border-white/[0.06]">

          {/* Source + rating row */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-primary" />
              <span className="font-headline font-semibold text-sm text-primary capitalize">{image.source}</span>
            </div>
            {image.rating && (
              <span
                className="ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-headline font-bold uppercase tracking-wide"
                style={RATING_STYLE[image.rating] ?? RATING_STYLE.explicit}
              >
                {image.rating}
              </span>
            )}
          </div>

          {/* Dimensions */}
          {image.width && image.height && (
            <p className="text-xs font-body text-outline">
              {image.width} × {image.height}px
              {image.fileType && image.fileType !== "image" && (
                <span className="ml-2 uppercase font-semibold text-primary">{image.fileType}</span>
              )}
            </p>
          )}

          {/* Score */}
          {image.score !== undefined && image.score !== null && (
            <p className="text-xs font-body text-on-surface-variant">
              Score: <span className="text-on-surface font-semibold">{image.score}</span>
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => (fav ? removeFavorite(image.id) : addFavorite(image))}
              className="flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-headline font-semibold transition-all duration-200 active:scale-95"
              style={
                fav
                  ? { background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }
                  : { background: "rgba(255,141,138,0.10)", color: "#ff8d8a", border: "1px solid rgba(255,141,138,0.25)" }
              }
            >
              <Heart className={`h-4 w-4 ${fav ? "fill-current" : ""}`} />
              {fav ? "Saved" : "Save"}
            </button>

            {image.sourceUrl && (
              <a
                href={image.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-headline font-semibold transition-all duration-200 active:scale-95"
                style={{ background: "rgba(255,255,255,0.06)", color: "#acaab1", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Source
              </a>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06]" />

          {/* Tags */}
          {image.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Tag className="h-3 w-3 text-on-surface-variant" />
                <span className="section-label">Tags ({image.tags.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto pr-1">
                {image.tags.slice(0, 100).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { addTag(tag); onClose(); }}
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-body text-on-surface-variant transition-all duration-150 active:scale-95 hover:text-primary"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                    title={`Filter by ${tag}`}
                  >
                    {tag.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

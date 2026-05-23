"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, ExternalLink, Tag } from "lucide-react";
import { HentaiImage } from "@/types";
import { useStore } from "@/store/useStore";

const SOURCE_BADGE: Record<string, React.CSSProperties> = {
  danbooru:  { background: "rgba(59,130,246,0.15)",  color: "#93c5fd",  border: "1px solid rgba(59,130,246,0.25)" },
  gelbooru:  { background: "rgba(34,197,94,0.12)",   color: "#86efac",  border: "1px solid rgba(34,197,94,0.25)" },
  rule34:    { background: "rgba(249,115,22,0.12)",  color: "#fdba74",  border: "1px solid rgba(249,115,22,0.25)" },
  "waifu.im":{ background: "rgba(255,141,138,0.12)", color: "#ff8d8a",  border: "1px solid rgba(255,141,138,0.25)" },
  nekos:     { background: "rgba(6,182,212,0.12)",   color: "#67e8f9",  border: "1px solid rgba(6,182,212,0.25)" },
  nekosia:   { background: "rgba(168,140,251,0.12)", color: "#a88cfb",  border: "1px solid rgba(168,140,251,0.25)" },
  fluxpoint: { background: "rgba(239,68,68,0.12)",   color: "#fca5a5",  border: "1px solid rgba(239,68,68,0.25)" },
};

interface Props {
  image: HentaiImage;
  onClick: (img: HentaiImage) => void;
}

export default function ImageCard({ image, onClick }: Props) {
  const { isFavorite, addFavorite, removeFavorite } = useStore();
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fav = isFavorite(image.id);

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    fav ? removeFavorite(image.id) : addFavorite(image);
  };

  if (imgError) return null;

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onClick={() => onClick(image)}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,141,138,0.25)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] w-full bg-surface-container">
        {/* Skeleton */}
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface-container to-surface-container-high" />
        )}

        <Image
          src={image.previewUrl ?? image.url}
          alt={image.tags.slice(0, 3).join(", ") || "image"}
          fill
          className={`object-cover transition-all duration-500 ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          } group-hover:scale-[1.03]`}
          onLoad={() => setLoaded(true)}
          onError={() => setImgError(true)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          unoptimized
        />

        {/* GIF badge */}
        {image.fileType === "gif" && (
          <span
            className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-headline font-bold tracking-wide uppercase"
            style={{ background: "rgba(255,193,7,0.9)", color: "#000" }}
          >
            GIF
          </span>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Action buttons — slide up on hover */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2.5 pb-2.5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={toggleFav}
            className="w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-150 active:scale-90"
            style={
              fav
                ? { background: "rgba(239,68,68,0.85)", color: "#fff" }
                : { background: "rgba(0,0,0,0.55)", color: "#acaab1" }
            }
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-3.5 w-3.5 ${fav ? "fill-current" : ""}`} />
          </button>

          {image.sourceUrl && (
            <a
              href={image.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-150 active:scale-90"
              style={{ background: "rgba(0,0,0,0.55)", color: "#acaab1" }}
              aria-label="View source"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-2.5 py-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-headline font-semibold tracking-wide uppercase"
          style={SOURCE_BADGE[image.source] ?? { background: "rgba(255,255,255,0.06)", color: "#76747b" }}
        >
          {image.source}
        </span>
        {image.tags.length > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-body text-outline">
            <Tag className="h-2.5 w-2.5" />
            {image.tags.length}
          </span>
        )}
      </div>
    </div>
  );
}

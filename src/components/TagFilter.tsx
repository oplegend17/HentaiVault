"use client";

import { X } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function TagFilter() {
  const { activeTags, removeTag, clearTags } = useStore();

  if (activeTags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="section-label">Active tags</span>
      {activeTags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-headline font-semibold text-primary transition-all"
          style={{ background: "rgba(255,141,138,0.10)", border: "1px solid rgba(255,141,138,0.25)" }}
        >
          {tag.replace(/_/g, " ")}
          <button
            onClick={() => removeTag(tag)}
            className="hover:text-on-surface transition-colors active:scale-95"
            aria-label={`Remove tag ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        onClick={clearTags}
        className="text-xs font-body text-on-surface-variant hover:text-error transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}

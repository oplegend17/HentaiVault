"use client";

import { useStore } from "@/store/useStore";
import { ApiSource } from "@/types";

const SOURCES: { id: ApiSource; label: string; activeStyle: React.CSSProperties; activeCls: string }[] = [
  {
    id: "danbooru",
    label: "Danbooru",
    activeStyle: { background: "rgba(59,130,246,0.15)", borderColor: "rgba(59,130,246,0.5)", color: "#93c5fd" },
    activeCls: "",
  },
  {
    id: "gelbooru",
    label: "Gelbooru",
    activeStyle: { background: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.4)", color: "#86efac" },
    activeCls: "",
  },
  {
    id: "rule34",
    label: "Rule34",
    activeStyle: { background: "rgba(249,115,22,0.12)", borderColor: "rgba(249,115,22,0.4)", color: "#fdba74" },
    activeCls: "",
  },
  {
    id: "waifu.im",
    label: "Waifu.im",
    activeStyle: { background: "rgba(255,141,138,0.12)", borderColor: "rgba(255,141,138,0.4)", color: "#ff8d8a" },
    activeCls: "",
  },
  {
    id: "nekos",
    label: "Nekos",
    activeStyle: { background: "rgba(6,182,212,0.12)", borderColor: "rgba(6,182,212,0.4)", color: "#67e8f9" },
    activeCls: "",
  },
  {
    id: "nekosia",
    label: "Nekosia",
    activeStyle: { background: "rgba(168,140,251,0.12)", borderColor: "rgba(168,140,251,0.4)", color: "#a88cfb" },
    activeCls: "",
  },
];

export default function SourceFilter() {
  const { activeSources, toggleSource } = useStore();

  return (
    <div className="flex flex-wrap gap-2">
      <span className="section-label self-center mr-1">Sources</span>
      {SOURCES.map(({ id, label, activeStyle }) => {
        const active = activeSources.includes(id);
        return (
          <button
            key={id}
            onClick={() => toggleSource(id)}
            className="rounded-full border px-3 py-1 text-xs font-headline font-semibold transition-all duration-200 active:scale-95"
            style={
              active
                ? activeStyle
                : {
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "#76747b",
                  }
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

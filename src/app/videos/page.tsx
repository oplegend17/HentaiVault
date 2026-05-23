"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Film, Shuffle, Zap } from "lucide-react";
import Gallery from "@/components/Gallery";
import SearchBar from "@/components/SearchBar";
import SourceFilter from "@/components/SourceFilter";
import TagFilter from "@/components/TagFilter";
import TagCloud from "@/components/TagCloud";
import { HentaiImage } from "@/types";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";

const FEATURE_PILLS = [
  { icon: Film,  label: "Videos Only", desc: "Pure video & animations feed" },
  { icon: Zap,   label: "Native Play", desc: "Inline HTML5 controls" },
  { icon: Shuffle, label: "Variety",     desc: "Aggregated sources" },
];

export default function VideosPage() {
  const [images, setImages] = useState<HentaiImage[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [r34AuthMissing, setR34AuthMissing] = useState(false);
  const [gelbooruAuthMissing, setGelbooruAuthMissing] = useState(false);
  const { activeSources, activeTags } = useStore();
  const router = useRouter();
  const fetchingRef = useRef(false);

  const fetchVideos = useCallback(
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
          videos: "true", // Fetch only videos!
        });

        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();

        setImages((prev) => (reset ? data.images : [...prev, ...data.images]));
        setHasMore(data.hasMore);
        setPage(currentPage + 1);
        setR34AuthMissing(!!data.r34AuthMissing);
        setGelbooruAuthMissing(!!data.gelbooruAuthMissing);
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
    fetchVideos(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSources, activeTags]);

  const handleLoadMore = useCallback(() => {
    fetchVideos(false);
  }, [fetchVideos]);

  return (
    <div className="space-y-8">

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="pt-4 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <Film
              className="h-8 w-8 text-primary animate-float"
              style={{ filter: "drop-shadow(0 0 12px rgba(255,141,138,0.6))" }}
            />
          </div>
          <h1
            className="font-headline font-extrabold text-4xl sm:text-5xl tracking-tight"
            style={{ background: "linear-gradient(135deg, #ff8d8a 0%, #ff794b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Vault Videos
          </h1>
        </div>
        <p className="font-body text-sm text-on-surface-variant max-w-md">
          Browse and play high-quality adult videos and animations from Rule34, Danbooru, and Gelbooru.
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

      {/* ── API Auth Warning Banners ─────────────────────────── */}
      {r34AuthMissing && activeSources.includes("rule34") && (
        <div
          className="rounded-2xl p-5 md:p-6 transition-all animate-reveal"
          style={{
            background: "rgba(249,115,22,0.08)",
            border: "1px solid rgba(249,115,22,0.25)",
            boxShadow: "0 8px 32px rgba(249,115,22,0.05)",
          }}
        >
          <div className="flex items-start gap-4">
            <span className="text-2xl mt-0.5 animate-pulse">⚠️</span>
            <div className="space-y-2">
              <h3 className="font-headline font-extrabold text-sm text-[#fdba74] tracking-tight uppercase">
                Rule34 API Authentication Required
              </h3>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                Rule34 now strictly blocks anonymous API requests, resulting in empty feeds. To restore Rule34 content:
              </p>
              <ol className="list-decimal list-inside font-body text-xs text-outline space-y-1.5 pl-1">
                <li>
                  Go to the{" "}
                  <a
                    href="https://rule34.xxx/index.php?page=account&s=options"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#fdba74] underline hover:text-white transition-colors"
                  >
                    Rule34 Options Page
                  </a>{" "}
                  and generate your API key.
                </li>
                <li>
                  Open your <code className="bg-black/40 px-1.5 py-0.5 rounded font-mono text-[10px]">.env.local</code> file in the project root.
                </li>
                <li>
                  Configure your credentials exactly like this:
                  <pre className="mt-1.5 p-2 bg-black/40 border border-white/5 rounded-lg font-mono text-[10px] text-white overflow-x-auto">
{`RULE34_USER_ID=6283230
RULE34_API_KEY=your_generated_api_key`}
                  </pre>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {gelbooruAuthMissing && activeSources.includes("gelbooru") && (
        <div
          className="rounded-2xl p-5 md:p-6 transition-all animate-reveal"
          style={{
            background: "rgba(168,140,251,0.08)",
            border: "1px solid rgba(168,140,251,0.25)",
            boxShadow: "0 8px 32px rgba(168,140,251,0.05)",
          }}
        >
          <div className="flex items-start gap-4">
            <span className="text-2xl mt-0.5">🔑</span>
            <div className="space-y-2">
              <h3 className="font-headline font-extrabold text-sm text-[#c0b0ff] tracking-tight uppercase">
                Gelbooru API Credentials Missing
              </h3>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                Gelbooru API queries now require authentication. Add your credentials to <code className="bg-black/40 px-1.5 py-0.5 rounded font-mono text-[10px]">.env.local</code> to enable Gelbooru content:
              </p>
              <pre className="p-2 bg-black/40 border border-white/5 rounded-lg font-mono text-[10px] text-white overflow-x-auto">
{`GELBOORU_USER_ID=your_gelbooru_user_id
GELBOORU_API_KEY=your_gelbooru_api_key`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ── Controls ─────────────────────────────────────── */}
      <div className="space-y-3">
        <SearchBar onSearch={() => { setPage(1); fetchVideos(true); }} placeholder="Search video tags, characters, series..." />
        <SourceFilter />
        <TagFilter />
        <TagCloud onTagSelect={() => { setPage(1); fetchVideos(true); }} />
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
            {images.length} videos loaded
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

"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import Gallery from "@/components/Gallery";
import SearchBar from "@/components/SearchBar";
import SourceFilter from "@/components/SourceFilter";
import TagFilter from "@/components/TagFilter";
import { HentaiImage } from "@/types";
import { useStore } from "@/store/useStore";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [images, setImages] = useState<HentaiImage[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const { activeSources, activeTags, userProfile } = useStore();
  const fetchingRef = useRef(false);

  const fetchImages = useCallback(
    async (q: string, reset = false) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setLoading(true);
      const currentPage = reset ? 1 : page;

      try {
        const allTags = [q, ...activeTags].filter(Boolean).join(" ");
        const params = new URLSearchParams({
          q: allTags,
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

  useEffect(() => {
    setPage(1);
    fetchImages(query, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSources, activeTags]);

  const handleSearch = (q: string) => {
    setQuery(q);
    setPage(1);
    fetchImages(q, true);
  };

  const handleLoadMore = useCallback(() => {
    fetchImages(query, false);
  }, [fetchImages, query]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="pt-2">
        <div className="flex items-center gap-2.5 mb-1">
          <Search className="h-5 w-5 text-primary" />
          <h1 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">
            Search
          </h1>
        </div>
        <p className="text-sm font-body text-on-surface-variant">
          Search across all sources simultaneously
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <SearchBar onSearch={handleSearch} />
        <SourceFilter />
        <TagFilter />
      </div>

      {/* Results meta */}
      {query && (
        <div className="flex items-center gap-2">
          <span className="section-label">Results for</span>
          <span
            className="rounded-full px-3 py-0.5 text-xs font-headline font-semibold text-primary"
            style={{ background: "rgba(255,141,138,0.10)", border: "1px solid rgba(255,141,138,0.2)" }}
          >
            {query}
          </span>
          {images.length > 0 && (
            <span className="text-xs font-body text-outline ml-auto">
              {images.length} loaded
            </span>
          )}
        </div>
      )}

      <Gallery
        images={images}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loading={loading}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-primary animate-spin" />
            <span className="text-sm font-body">Loading...</span>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

export default function Loading() {
  return (
    <div className="space-y-8 pt-4">
      {/* Hero skeleton */}
      <div className="space-y-3">
        <div className="h-10 w-48 rounded-full animate-pulse bg-surface-container-high" />
        <div className="h-4 w-72 rounded-full animate-pulse bg-surface-container" />
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-28 rounded-full animate-pulse bg-surface-container" />
          ))}
        </div>
      </div>

      {/* Search skeleton */}
      <div className="h-12 w-full rounded-xl animate-pulse bg-surface-container" />

      {/* Source pills skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-7 w-20 rounded-full animate-pulse bg-surface-container" />
        ))}
      </div>

      {/* Gallery skeleton — masonry */}
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-5 space-y-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="break-inside-avoid rounded-xl animate-pulse bg-surface-container"
            style={{ height: `${180 + (i % 5) * 40}px` }}
          />
        ))}
      </div>
    </div>
  );
}

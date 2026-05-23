"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center">
      <div
        className="w-24 h-24 flex items-center justify-center rounded-full"
        style={{
          background: "rgba(213,61,24,0.10)",
          border: "1px solid rgba(213,61,24,0.2)",
        }}
      >
        <AlertTriangle className="h-10 w-10 text-error" />
      </div>

      <div>
        <p className="section-label mb-2">Something went wrong</p>
        <h1 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight mb-2">
          Failed to load
        </h1>
        <p className="font-body text-sm text-on-surface-variant max-w-xs mx-auto">
          An error occurred while fetching content. This is usually a temporary API issue.
        </p>
      </div>

      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-headline font-bold transition-all duration-200 active:scale-95"
        style={{
          background: "rgba(255,115,81,0.12)",
          color: "#ff7351",
          border: "1px solid rgba(255,115,81,0.25)",
        }}
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}

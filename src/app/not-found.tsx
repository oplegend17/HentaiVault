import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center">
      {/* Icon */}
      <div
        className="w-24 h-24 flex items-center justify-center rounded-full"
        style={{
          background: "rgba(255,141,138,0.08)",
          border: "1px solid rgba(255,141,138,0.15)",
        }}
      >
        <SearchX className="h-10 w-10 text-primary" />
      </div>

      {/* Copy */}
      <div>
        <p className="section-label mb-2">404</p>
        <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight mb-2">
          Page not found
        </h1>
        <p className="font-body text-sm text-on-surface-variant max-w-xs mx-auto">
          This page doesn&apos;t exist. Head back home and keep browsing.
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/"
        className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-headline font-bold text-on-primary-fixed transition-all duration-200 active:scale-95 hover:opacity-90"
        style={{
          background: "linear-gradient(135deg, #ff8d8a 0%, #ff794b 100%)",
          boxShadow: "0 12px 24px rgba(255,141,138,0.25)",
        }}
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}

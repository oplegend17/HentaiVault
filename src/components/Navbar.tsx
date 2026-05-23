"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Shuffle, Search, Flame, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/random", label: "Random", icon: Shuffle },
  { href: "/favorites", label: "Favorites", icon: Heart },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.05] bg-surface/70 backdrop-blur-2xl">
      <div className="page-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Flame
              className="h-5 w-5 text-primary transition-all duration-300 group-hover:scale-110"
              style={{ filter: "drop-shadow(0 0 8px rgba(255,141,138,0.5))" }}
            />
          </div>
          <span
            className="font-headline font-extrabold text-lg tracking-tight"
            style={{ background: "linear-gradient(135deg, #ff8d8a 0%, #ff794b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            HentaiVault
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-headline font-semibold
                  transition-all duration-200 active:scale-95
                  ${active
                    ? "text-on-primary-fixed shadow-primary"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-white/[0.05]"
                  }
                `}
                style={active ? { background: "linear-gradient(135deg, #ff8d8a 0%, #ff794b 100%)", boxShadow: "0 8px 20px rgba(255,141,138,0.25)" } : {}}
              >
                <Icon className="h-4 w-4" style={active ? { fontVariationSettings: "'FILL' 1" } : {}} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.08] text-on-surface-variant hover:text-on-surface transition-all active:scale-95"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.05] bg-surface-container-low/80 backdrop-blur-xl px-4 py-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-headline font-semibold
                  transition-all duration-200 active:scale-95
                  ${active
                    ? "text-on-primary-fixed"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-white/[0.05]"
                  }
                `}
                style={active ? { background: "linear-gradient(135deg, #ff8d8a 0%, #ff794b 100%)" } : {}}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

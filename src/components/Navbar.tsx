"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Shuffle, Search, Flame, Menu, X, Film, Sparkles, Shield, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useStore } from "@/store/useStore";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/videos", label: "Videos", icon: Film },
  { href: "/gifs", label: "GIFs", icon: Sparkles },
  { href: "/random", label: "Random", icon: Shuffle },
  { href: "/favorites", label: "Favorites", icon: Heart },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, userProfile, setAuthModalOpen } = useStore();

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

        {/* Desktop navigation & auth */}
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex items-center gap-1">
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

          {/* Vertical Separator */}
          <div className="h-5 w-[1px] bg-white/10" />

          {/* Auth section */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {userProfile?.role === "admin" && (
                  <Link
                    href="/admin"
                    className={`
                      flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-headline font-bold
                      transition-all duration-200 border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 active:scale-95
                    `}
                  >
                    <Shield className="h-3.5 w-3.5 animate-pulse" />
                    Admin
                  </Link>
                )}
                <span className="text-sm font-headline font-semibold text-outline-variant">
                  @{userProfile?.username || "User"}
                </span>
                <button
                  onClick={() => signOut(auth)}
                  className="flex items-center justify-center p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-white/[0.05] transition-all active:scale-95"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-headline font-semibold bg-white/[0.05] border border-white/[0.08] text-white hover:bg-white/[0.1] hover:border-white/20 transition-all active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
            )}
          </div>
        </div>

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
        <div className="md:hidden border-t border-white/[0.05] bg-surface-container-low/80 backdrop-blur-xl px-4 py-3 space-y-3">
          <div className="space-y-1">
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

          <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
            {currentUser ? (
              <>
                <div className="flex items-center justify-between px-4 py-1">
                  <span className="text-sm font-headline font-semibold text-outline-variant">
                    @{userProfile?.username || "User"}
                  </span>
                  {userProfile?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-1 text-xs font-headline font-bold text-primary animate-pulse"
                    >
                      <Shield className="h-3 w-3" />
                      Admin Panel
                    </Link>
                  )}
                </div>
                <button
                  onClick={() => {
                    signOut(auth);
                    setMobileOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-headline font-semibold bg-white/[0.05] border border-white/[0.08] text-red-400 hover:bg-red-500/10 transition-all active:scale-95"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setAuthModalOpen(true);
                  setMobileOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-headline font-semibold bg-primary text-on-primary hover:bg-primary-hover transition-all active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

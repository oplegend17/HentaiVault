"use client";

import { useState, FormEvent } from "react";
import { Search, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";

interface Props {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search tags, characters, series...",
}: Props) {
  const { searchQuery, setSearchQuery } = useStore();
  const [local, setLocal] = useState(searchQuery);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSearchQuery(local);
    if (onSearch) {
      onSearch(local);
    } else {
      router.push(`/search?q=${encodeURIComponent(local)}`);
    }
  };

  const clear = () => {
    setLocal("");
    setSearchQuery("");
    if (onSearch) onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full group">
      <div className="relative glass-card rounded-xl border border-outline-variant/20 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-200">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
        <input
          type="text"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent py-3.5 pl-11 pr-11 text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 outline-none border-none focus:ring-0"
        />
        {local && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.06] text-on-surface-variant hover:text-on-surface hover:bg-white/[0.10] transition-all active:scale-95"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </form>
  );
}

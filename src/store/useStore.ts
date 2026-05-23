import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HentaiImage, ApiSource } from "@/types";

interface AppState {
  // Favorites
  favorites: HentaiImage[];
  addFavorite: (img: HentaiImage) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeSources: ApiSource[];
  toggleSource: (src: ApiSource) => void;
  activeTags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  clearTags: () => void;

  // UI
  selectedImage: HentaiImage | null;
  setSelectedImage: (img: HentaiImage | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const ALL_SOURCES: ApiSource[] = ["danbooru", "gelbooru", "rule34", "waifu.im", "nekos", "nekosia"];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Favorites
      favorites: [],
      addFavorite: (img) =>
        set((s) => ({ favorites: [img, ...s.favorites.filter((f) => f.id !== img.id)] })),
      removeFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),
      isFavorite: (id) => get().favorites.some((f) => f.id === id),

      // Search
      searchQuery: "",
      setSearchQuery: (q) => set({ searchQuery: q }),
      activeSources: ["danbooru", "gelbooru", "rule34", "waifu.im", "nekos"],
      toggleSource: (src) =>
        set((s) => ({
          activeSources: s.activeSources.includes(src)
            ? s.activeSources.filter((x) => x !== src)
            : [...s.activeSources, src],
        })),
      activeTags: [],
      addTag: (tag) =>
        set((s) => ({
          activeTags: s.activeTags.includes(tag) ? s.activeTags : [...s.activeTags, tag],
        })),
      removeTag: (tag) =>
        set((s) => ({ activeTags: s.activeTags.filter((t) => t !== tag) })),
      clearTags: () => set({ activeTags: [] }),

      // UI
      selectedImage: null,
      setSelectedImage: (img) => set({ selectedImage: img }),
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "hentaivault-store",
      partialize: (s) => ({ favorites: s.favorites, activeSources: s.activeSources }),
    }
  )
);

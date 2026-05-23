import { HentaiImage, SearchParams, ApiSource } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapRating(r: string): "safe" | "questionable" | "explicit" {
  if (r === "s" || r === "safe" || r === "g" || r === "general") return "safe";
  if (r === "q" || r === "questionable" || r === "sensitive") return "questionable";
  return "explicit";
}

function detectFileType(ext: string): "image" | "gif" | "video" {
  if (!ext) return "image";
  const e = ext.toLowerCase();
  if (e === "gif") return "gif";
  if (e === "mp4" || e === "webm") return "video";
  return "image";
}

/** Safe fetch — returns null on any error instead of throwing */
async function safeFetch(url: string, init?: RequestInit): Promise<unknown> {
  try {
    const res = await fetch(url, { next: { revalidate: 60 }, ...init });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Danbooru ────────────────────────────────────────────────────────────────
// Uses server-side env vars — never exposed to the browser.
async function fetchDanbooru(params: SearchParams): Promise<HentaiImage[]> {
  const login  = process.env.DANBOORU_LOGIN   ?? "";
  const apiKey = process.env.DANBOORU_API_KEY ?? "";

  // Build tag string — default to explicit rating if no query
  const rawTags = params.query
    ? params.query.trim().split(/\s+/).join("+")
    : params.tags?.join("+") ?? "rating:explicit";

  const page  = params.page  ?? 1;
  const limit = Math.min(params.limit ?? 20, 200); // Danbooru max is 200

  // Authenticated URL — Basic Auth via URL credentials
  const auth = login && apiKey ? `${encodeURIComponent(login)}:${encodeURIComponent(apiKey)}@` : "";
  const url  = `https://${auth}danbooru.donmai.us/posts.json?tags=${encodeURIComponent(rawTags)}&page=${page}&limit=${limit}`;

  const data = await safeFetch(url);
  if (!Array.isArray(data)) return [];

  return (data as Record<string, unknown>[])
    .filter((p) => p.large_file_url || p.file_url)
    .map((p) => ({
      id:         `danbooru-${p.id}`,
      url:        (p.large_file_url ?? p.file_url) as string,
      previewUrl: (p.preview_file_url ?? p.large_file_url ?? p.file_url) as string,
      source:     "danbooru" as ApiSource,
      tags:       ((p.tag_string as string) ?? "").split(" ").filter(Boolean),
      width:      p.image_width  as number,
      height:     p.image_height as number,
      rating:     mapRating(p.rating as string),
      fileType:   detectFileType(p.file_ext as string),
      sourceUrl:  `https://danbooru.donmai.us/posts/${p.id}`,
      score:      p.score as number,
    }));
}

// ─── Gelbooru ────────────────────────────────────────────────────────────────
async function fetchGelbooru(params: SearchParams): Promise<HentaiImage[]> {
  const tags  = params.query || params.tags?.join(" ") || "rating:explicit";
  const page  = params.page  ?? 0;
  const limit = params.limit ?? 20;

  const url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(tags)}&pid=${page}&limit=${limit}`;
  const data = await safeFetch(url) as Record<string, unknown> | null;
  if (!data) return [];

  const posts = (data?.post ?? []) as Record<string, unknown>[];
  return posts.map((p) => ({
    id:        `gelbooru-${p.id}`,
    url:       p.file_url    as string,
    previewUrl:(p.preview_url ?? p.file_url) as string,
    source:    "gelbooru" as ApiSource,
    tags:      ((p.tags as string) ?? "").split(" ").filter(Boolean),
    width:     p.width  as number,
    height:    p.height as number,
    rating:    mapRating(p.rating as string),
    fileType:  detectFileType(p.image as string),
    sourceUrl: `https://gelbooru.com/index.php?page=post&s=view&id=${p.id}`,
    score:     p.score  as number,
  }));
}

// ─── Rule34 ──────────────────────────────────────────────────────────────────
async function fetchRule34(params: SearchParams): Promise<HentaiImage[]> {
  const tags  = params.query || params.tags?.join(" ") || "hentai";
  const page  = params.page  ?? 0;
  const limit = params.limit ?? 20;

  const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(tags)}&pid=${page}&limit=${limit}`;
  const data = await safeFetch(url);
  if (!Array.isArray(data)) return [];

  return (data as Record<string, unknown>[]).map((p) => ({
    id:        `rule34-${p.id}`,
    url:       p.file_url    as string,
    previewUrl:(p.preview_url ?? p.file_url) as string,
    source:    "rule34" as ApiSource,
    tags:      ((p.tags as string) ?? "").split(" ").filter(Boolean),
    width:     p.width  as number,
    height:    p.height as number,
    rating:    "explicit" as const,
    fileType:  detectFileType(p.image as string),
    sourceUrl: `https://rule34.xxx/index.php?page=post&s=view&id=${p.id}`,
    score:     p.score  as number,
  }));
}

// ─── Waifu.im ────────────────────────────────────────────────────────────────
async function fetchWaifuIm(params: SearchParams): Promise<HentaiImage[]> {
  const limit = Math.min(params.limit ?? 20, 30);
  const url   = `https://api.waifu.im/search?is_nsfw=true&many=true&limit=${limit}`;
  const data  = await safeFetch(url) as Record<string, unknown> | null;
  if (!data) return [];

  const images = (data?.images ?? []) as Record<string, unknown>[];
  return images.map((img) => ({
    id:        `waifuim-${img.image_id}`,
    url:       img.url         as string,
    previewUrl:(img.preview_url ?? img.url) as string,
    source:    "waifu.im" as ApiSource,
    tags:      ((img.tags as { name: string }[]) ?? []).map((t) => t.name),
    width:     img.width  as number,
    height:    img.height as number,
    rating:    "explicit" as const,
    fileType:  detectFileType(img.extension as string),
    sourceUrl: img.source as string,
  }));
}

// ─── Nekos API v4 ────────────────────────────────────────────────────────────
async function fetchNekos(params: SearchParams): Promise<HentaiImage[]> {
  const limit = Math.min(params.limit ?? 20, 25);
  const url   = `https://api.nekosapi.com/v4/images/random?rating=explicit&limit=${limit}`;
  const data  = await safeFetch(url) as Record<string, unknown> | null;
  if (!data) return [];

  const items = (data?.items ?? data ?? []) as Record<string, unknown>[];
  if (!Array.isArray(items)) return [];

  return items.map((img) => ({
    id:        `nekos-${img.id}`,
    url:       img.image_url  as string,
    previewUrl:(img.sample_url ?? img.image_url) as string,
    source:    "nekos" as ApiSource,
    tags:      ((img.tags as { name: string }[]) ?? []).map((t) => t.name),
    width:     img.width  as number,
    height:    img.height as number,
    rating:    "explicit" as const,
    fileType:  "image" as const,
    sourceUrl: img.source as string,
  }));
}

// ─── Nekosia ─────────────────────────────────────────────────────────────────
async function fetchNekosia(params: SearchParams): Promise<HentaiImage[]> {
  const limit = Math.min(params.limit ?? 20, 20);
  const url   = `https://api.nekosia.cat/api/v1/images/hentai?count=${limit}&additionalTags=explicit`;
  const data  = await safeFetch(url) as Record<string, unknown> | null;
  if (!data) return [];

  const images = (data?.images ?? []) as Record<string, unknown>[];
  return images.map((img) => ({
    id:        `nekosia-${img.id}`,
    url:       img.url as string,
    previewUrl:img.url as string,
    source:    "nekosia" as ApiSource,
    tags:      (img.tags as string[]) ?? [],
    rating:    "explicit" as const,
    fileType:  "image" as const,
    sourceUrl: img.source as string,
  }));
}

// ─── Source registry ─────────────────────────────────────────────────────────
const fetchers: Record<ApiSource, (p: SearchParams) => Promise<HentaiImage[]>> = {
  danbooru:   fetchDanbooru,
  gelbooru:   fetchGelbooru,
  rule34:     fetchRule34,
  "waifu.im": fetchWaifuIm,
  nekos:      fetchNekos,
  nekosia:    fetchNekosia,
  fluxpoint:  async () => [], // requires separate API key
};

// ─── Unified search ──────────────────────────────────────────────────────────
export async function searchImages(params: SearchParams): Promise<HentaiImage[]> {
  const sources = params.sources ?? (
    ["danbooru", "gelbooru", "rule34", "waifu.im", "nekos"] as ApiSource[]
  );

  const results = await Promise.allSettled(
    sources.map((src) => fetchers[src](params))
  );

  const images: HentaiImage[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") images.push(...r.value);
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const deduped = images.filter((img) => {
    if (!img.url || seen.has(img.url)) return false;
    seen.add(img.url);
    return true;
  });

  // Shuffle for variety
  return deduped.sort(() => Math.random() - 0.5);
}

export async function getRandomImages(count = 20): Promise<HentaiImage[]> {
  return searchImages({
    query:   "",
    limit:   count,
    sources: ["waifu.im", "nekos", "danbooru"] as ApiSource[],
  });
}

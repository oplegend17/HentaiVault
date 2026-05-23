import { HentaiImage, SearchParams, ApiSource } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapRating(r: string): "safe" | "questionable" | "explicit" {
  if (r === "s" || r === "safe" || r === "g" || r === "general") return "safe";
  if (r === "q" || r === "questionable" || r === "sensitive") return "questionable";
  return "explicit";
}

function detectFileType(ext: string): "image" | "gif" | "video" {
  if (!ext) return "image";
  const e = ext.toLowerCase().replace(".", "");
  if (e === "gif") return "gif";
  if (e === "mp4" || e === "webm" || e === "m4v") return "video";
  return "image";
}

/** Safe fetch — returns null on any error instead of throwing */
async function safeFetch(url: string, init?: RequestInit): Promise<unknown> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      ...init,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ...init?.headers,
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Danbooru ────────────────────────────────────────────────────────────────
// Docs: https://danbooru.donmai.us/wiki_pages/api:posts
// Auth via ?login=&api_key= — Gold tier with key (200 results/page, explicit content)
async function fetchDanbooru(params: SearchParams): Promise<HentaiImage[]> {
  const login  = process.env.DANBOORU_LOGIN   ?? "";
  const apiKey = process.env.DANBOORU_API_KEY ?? "";

  let rawTags = params.query
    ? params.query.trim().split(/\s+/).join("+")
    : params.tags?.join("+") ?? "rating:explicit";

  if (params.onlyVideos) {
    rawTags += "+type:video";
  }
  if (params.onlyGifs) {
    rawTags += "+file_ext:gif";
  }

  const page  = params.page  ?? 1;
  const limit = Math.min(params.limit ?? 20, 200);

  const authParams = apiKey
    ? `&api_key=${encodeURIComponent(apiKey)}${login ? `&login=${encodeURIComponent(login)}` : ""}`
    : "";

  const url = `https://danbooru.donmai.us/posts.json?tags=${encodeURIComponent(rawTags)}&page=${page}&limit=${limit}${authParams}`;

  const data = await safeFetch(url);
  if (!Array.isArray(data)) return [];

  return (data as Record<string, unknown>[])
    .filter((p) => p.large_file_url || p.file_url)
    .map((p) => {
      const fileExt   = (p.file_ext as string) ?? "";
      const fileType  = detectFileType(fileExt);
      const mediaUrl  = (p.large_file_url ?? p.file_url) as string;
      return {
        id:         `danbooru-${p.id}`,
        url:        fileType === "video" ? (p.preview_file_url as string ?? mediaUrl) : mediaUrl,
        previewUrl: (p.preview_file_url ?? p.large_file_url ?? p.file_url) as string,
        videoUrl:   fileType === "video" ? mediaUrl : undefined,
        source:     "danbooru" as ApiSource,
        tags:       ((p.tag_string as string) ?? "").split(" ").filter(Boolean),
        width:      p.image_width  as number,
        height:     p.image_height as number,
        rating:     mapRating(p.rating as string),
        fileType,
        sourceUrl:  `https://danbooru.donmai.us/posts/${p.id}`,
        score:      p.score as number,
      };
    });
}



// ─── Rule34 ──────────────────────────────────────────────────────────────────
// Docs: https://rule34.xxx/index.php?page=help&topic=dapi
// Auth: &user_id=&api_key= query params
// Videos: mp4/webm posts have file_url pointing to video, sample_url for preview
// Limit: hard max 1000 per request
async function fetchRule34(params: SearchParams): Promise<HentaiImage[]> {
  const userId = process.env.RULE34_USER_ID ?? "";
  const apiKey = process.env.RULE34_API_KEY ?? "";

  let tags  = params.query || params.tags?.join(" ") || "hentai";
  if (params.onlyVideos) {
    tags += " video";
  }
  if (params.onlyGifs) {
    tags += " gif";
  }
  const pid   = (params.page ?? 1) - 1; // Rule34 uses 0-based page index
  const limit = Math.min(params.limit ?? 20, 1000);

  // Auth params — append if credentials are available
  const authParams = userId
    ? `&user_id=${encodeURIComponent(userId)}${apiKey ? `&api_key=${encodeURIComponent(apiKey)}` : ""}`
    : "";

  const url  = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(tags)}&pid=${pid}&limit=${limit}${authParams}`;
  const data = await safeFetch(url);
  if (!Array.isArray(data)) return [];

  return (data as Record<string, unknown>[])
    .filter((p) => p.file_url)
    .map((p) => {
      const fileUrl  = p.file_url as string;
      // Rule34 stores extension in the URL — extract it
      const ext      = fileUrl.split("?")[0].split(".").pop() ?? "";
      const fileType = detectFileType(ext);

      // For videos: use sample_url (thumbnail) as the display image
      // For images/gifs: use file_url directly
      const displayUrl  = fileType === "video"
        ? ((p.sample_url ?? p.preview_url ?? fileUrl) as string)
        : fileUrl;
      const previewUrl  = (p.sample_url ?? p.preview_url ?? fileUrl) as string;

      return {
        id:        `rule34-${p.id}`,
        url:       displayUrl,
        previewUrl,
        videoUrl:  fileType === "video" ? fileUrl : undefined,
        source:    "rule34" as ApiSource,
        tags:      ((p.tags as string) ?? "").split(" ").filter(Boolean),
        width:     p.width  as number,
        height:    p.height as number,
        rating:    "explicit" as const,
        fileType,
        sourceUrl: `https://rule34.xxx/index.php?page=post&s=view&id=${p.id}`,
        score:     p.score  as number,
      };
    });
}

// ─── Waifu.im ────────────────────────────────────────────────────────────────
// Docs: https://docs.waifu.im
// Endpoint: GET /images — response: { items: [...] }
// IsNsfw: True | False | All
// IncludedTags: AND logic (all must match)
async function fetchWaifuIm(params: SearchParams): Promise<HentaiImage[]> {
  const pageSize = Math.min(params.limit ?? 20, 30);
  const page     = params.page ?? 1;

  const qs = new URLSearchParams({
    IsNsfw:   "True",
    PageSize: String(pageSize),
    Page:     String(page),
  });

  // Pass first search word as a tag slug if provided
  if (params.query) {
    const words = params.query.trim().split(/\s+/).filter(Boolean);
    if (words.length > 0) qs.append("IncludedTags", words[0]);
  }

  const url  = `https://api.waifu.im/images?${qs.toString()}`;
  const data = await safeFetch(url) as Record<string, unknown> | null;
  if (!data) return [];

  const items = (data?.items ?? []) as Record<string, unknown>[];
  return items
    .filter((img) => img.url)
    .map((img) => {
      const ext      = (img.extension as string) ?? "";
      const fileType = detectFileType(ext);
      return {
        id:        `waifuim-${img.id}`,
        url:       img.url as string,
        previewUrl:img.url as string,
        videoUrl:  fileType === "video" ? (img.url as string) : undefined,
        source:    "waifu.im" as ApiSource,
        tags:      ((img.tags as { name: string; slug: string }[]) ?? []).map(
          (t) => t.slug ?? t.name
        ),
        width:     img.width    as number,
        height:    img.height   as number,
        rating:    (img.isNsfw ? "explicit" : "safe") as "safe" | "explicit",
        fileType,
        sourceUrl: img.source   as string,
      };
    });
}



const fetchers: Record<ApiSource, (p: SearchParams) => Promise<HentaiImage[]>> = {
  danbooru:   fetchDanbooru,
  rule34:     fetchRule34,
  "waifu.im": fetchWaifuIm,
  fluxpoint:  async () => [],
};

// ─── Unified search ──────────────────────────────────────────────────────────
export async function searchImages(params: SearchParams): Promise<HentaiImage[]> {
  let sources = params.sources ?? (
    ["danbooru", "rule34", "waifu.im"] as ApiSource[]
  );

  // Filter sources to ensure they are valid fetcher functions, preventing crashes from persisted obsolete client configurations
  sources = sources.filter((src) => src in fetchers);

  if (params.onlyVideos) {
    sources = ["rule34"];
  }

  const results = await Promise.allSettled(
    sources.map((src) => fetchers[src](params))
  );

  const images: HentaiImage[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") images.push(...r.value);
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  let deduped = images.filter((img) => {
    const key = img.videoUrl ?? img.url;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (params.onlyVideos) {
    deduped = deduped.filter((img) => img.fileType === "video");
  }

  if (params.onlyGifs) {
    deduped = deduped.filter((img) => img.fileType === "gif");
  }

  // Shuffle for variety
  return deduped.sort(() => Math.random() - 0.5);
}

export async function getRandomImages(count = 20): Promise<HentaiImage[]> {
  const portion = Math.ceil(count / 3);
  return searchImages({
    query:   "",
    limit:   portion,
    sources: ["waifu.im", "danbooru", "rule34"] as ApiSource[],
  });
}

// ─── Rule34 autocomplete ─────────────────────────────────────────────────────
// Used by the search bar to suggest tags as the user types
export async function autocompleteRule34(q: string): Promise<{ label: string; value: string; count?: number }[]> {
  if (!q || q.length < 2) return [];
  try {
    const url = `https://rule34.xxx/autocomplete.php?q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    // Rule34 autocomplete returns: [{ label, value, post_count? }]
    return (data as Record<string, unknown>[]).slice(0, 10).map((item) => ({
      label: (item.label ?? item.value ?? item.tag) as string,
      value: (item.value ?? item.tag ?? item.label) as string,
      count: item.post_count as number | undefined,
    }));
  } catch {
    return [];
  }
}

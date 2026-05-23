export interface HentaiImage {
  id: string;
  url: string;
  previewUrl?: string;
  source: ApiSource;
  tags: string[];
  width?: number;
  height?: number;
  rating?: "safe" | "questionable" | "explicit";
  /** image | gif | video (mp4/webm) */
  fileType?: "image" | "gif" | "video";
  /** Direct video URL for mp4/webm posts */
  videoUrl?: string;
  sourceUrl?: string;
  score?: number;
}

export type ApiSource =
  | "danbooru"
  | "rule34"
  | "waifu.im"
  | "fluxpoint";

export interface SearchParams {
  query: string;
  tags?: string[];
  sources?: ApiSource[];
  page?: number;
  limit?: number;
  rating?: "safe" | "questionable" | "explicit" | "all";
  onlyVideos?: boolean;
  onlyGifs?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  userId: string;
  imageIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface User {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  isAnonymous: boolean;
}

export interface AutocompleteTag {
  label: string;
  value: string;
  count?: number;
}

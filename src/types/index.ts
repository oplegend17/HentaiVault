export interface HentaiImage {
  id: string;
  url: string;
  previewUrl?: string;
  source: ApiSource;
  tags: string[];
  width?: number;
  height?: number;
  rating?: "safe" | "questionable" | "explicit";
  fileType?: "image" | "gif" | "video";
  sourceUrl?: string;
  score?: number;
}

export type ApiSource =
  | "danbooru"
  | "gelbooru"
  | "rule34"
  | "waifu.im"
  | "nekos"
  | "nekosia"
  | "fluxpoint";

export interface SearchParams {
  query: string;
  tags?: string[];
  sources?: ApiSource[];
  page?: number;
  limit?: number;
  rating?: "safe" | "questionable" | "explicit" | "all";
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

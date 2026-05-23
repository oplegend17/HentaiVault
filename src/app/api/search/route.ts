import { NextRequest, NextResponse } from "next/server";
import { searchImages } from "@/lib/api";
import { ApiSource } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const sourcesParam = searchParams.get("sources");
  const onlyVideos = searchParams.get("videos") === "true";
  const onlyGifs = searchParams.get("gifs") === "true";
  const sources = sourcesParam
    ? (sourcesParam.split(",") as ApiSource[])
    : undefined;

  const r34AuthMissing = !process.env.RULE34_API_KEY || !process.env.RULE34_USER_ID;

  try {
    const images = await searchImages({ query, page, limit, sources, onlyVideos, onlyGifs });
    return NextResponse.json({
      images,
      page,
      hasMore: images.length >= limit,
      r34AuthMissing,
    });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

// Fetches available tags from Waifu.im
// GET /api/tags
export async function GET() {
  try {
    const res = await fetch("https://api.waifu.im/tags", {
      next: { revalidate: 3600 }, // cache for 1 hour
    });
    if (!res.ok) return NextResponse.json({ tags: [] });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ tags: [] });
  }
}

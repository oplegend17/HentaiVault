import { NextRequest, NextResponse } from "next/server";
import { getRandomImages } from "@/lib/api";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const count = parseInt(searchParams.get("count") ?? "20", 10);

  try {
    const images = await getRandomImages(count);
    return NextResponse.json({ images });
  } catch (err) {
    console.error("Random error:", err);
    return NextResponse.json({ error: "Failed to fetch random images" }, { status: 500 });
  }
}

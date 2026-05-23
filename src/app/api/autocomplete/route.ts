import { NextRequest, NextResponse } from "next/server";
import { autocompleteRule34 } from "@/lib/api";

// GET /api/autocomplete?q=term
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }
  const results = await autocompleteRule34(q);
  return NextResponse.json(results);
}

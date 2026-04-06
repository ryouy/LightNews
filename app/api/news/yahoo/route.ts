import { NextResponse } from "next/server";
import { scrapeYahooCategoryNews } from "@/lib/scrapeYahoo";
import { isYahooNewsCategory, type YahooNewsCategory } from "@/lib/yahooCategories";

export const revalidate = 300;
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("category") ?? "top";
  const category: YahooNewsCategory = isYahooNewsCategory(raw)
    ? raw
    : "top";

  try {
    const data = await scrapeYahooCategoryNews(category);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json([], {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60",
      },
    });
  }
}

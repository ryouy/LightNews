import { NextResponse } from "next/server";
import {
  scrapeYahooCategoryNews,
  scrapeYahooSearchNews,
} from "@/lib/scrapeYahoo";
import { isYahooNewsCategory, type YahooNewsCategory } from "@/lib/yahooCategories";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? searchParams.get("search") ?? "").trim();
  const rawCat = searchParams.get("category") ?? "world";
  const category: YahooNewsCategory = isYahooNewsCategory(rawCat)
    ? rawCat
    : "world";

  try {
    const data =
      q.length > 0
        ? await scrapeYahooSearchNews(q)
        : await scrapeYahooCategoryNews(category);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json([], {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  }
}

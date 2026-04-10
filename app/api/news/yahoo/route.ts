import { NextResponse } from "next/server";
import {
  scrapeYahooCategoryNews,
  scrapeYahooSearchNews,
} from "@/lib/scrapeYahoo";
import { parseNewsLimitParam } from "@/lib/newsLimit";
import { parseYahooFeedParam } from "@/lib/yahooFeed";
import {
  isYahooNewsCategory,
  type YahooNewsCategory,
} from "@/lib/yahooCategories";

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
  const limit = parseNewsLimitParam(searchParams.get("n"));
  const feed = parseYahooFeedParam(searchParams.get("feed"));

  try {
    const data =
      q.length > 0
        ? await scrapeYahooSearchNews(q, limit)
        : await scrapeYahooCategoryNews(category, limit, feed);
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

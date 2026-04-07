import * as cheerio from "cheerio";
import type { NewsItem } from "./types";
import { fetchHtml } from "./fetchHtml";
import { YAHOO_SEARCH_QUERY_MAX_CHARS } from "./yahooSearch";
import type { YahooNewsCategory } from "./yahooCategories";
import { YAHOO_CATEGORY_URL } from "./yahooCategories";

type CheerioLoaded = ReturnType<typeof cheerio.load>;

const MAX_ITEMS = 35;
const BODY_FETCH_CONCURRENCY = 4;

/** 例: https://news.yahoo.co.jp/articles/3bc11c1aff5aff87b8d04f5be15f9968157a86cc */
function canonicalArticleUrl(href: string): string | null {
  if (!href || /promo/i.test(href)) return null;
  const abs = absolutizeYahoo(href.split("#")[0]!.split("?")[0]!);
  try {
    const u = new URL(abs);
    if (u.hostname !== "news.yahoo.co.jp") return null;
    const m = u.pathname.match(/^\/articles\/([a-f0-9]{20,})\/?$/i);
    if (!m) return null;
    return `https://news.yahoo.co.jp/articles/${m[1]!.toLowerCase()}`;
  } catch {
    return null;
  }
}

function absolutizeYahoo(href: string): string {
  if (href.startsWith("http")) return href;
  if (href.startsWith("//")) return `https:${href}`;
  return `https://news.yahoo.co.jp${href.startsWith("/") ? "" : "/"}${href}`;
}

/** 検索結果の `4/7(火) 11:25` 形式 */
function parseYahooSearchListTime(raw: string): string | undefined {
  const t = raw.trim();
  const m = t.match(
    /^(\d{1,2})\/(\d{1,2})\([^)]+\)\s*(\d{1,2}):(\d{2})/,
  );
  if (!m) return undefined;
  const month = Number(m[1]);
  const day = Number(m[2]);
  const h = Number(m[3]);
  const min = Number(m[4]);
  const now = new Date();
  let year = now.getFullYear();
  const candidate = new Date(year, month - 1, day, h, min, 0, 0);
  if (candidate > now) year -= 1;
  const d = new Date(year, month - 1, day, h, min, 0, 0);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function parseYahooDateText(
  datePart: string,
  timePart: string,
): string | undefined {
  const dm = datePart.match(/(\d+)\/(\d+)/);
  if (!dm) return undefined;
  const month = Number(dm[1]);
  const day = Number(dm[2]);
  const now = new Date();
  let year = now.getFullYear();
  const candidate = new Date(year, month - 1, day);
  if (candidate > now) year -= 1;
  const tm = timePart.match(/(\d{1,2}):(\d{2})/);
  const h = tm ? Number(tm[1]) : 0;
  const min = tm ? Number(tm[2]) : 0;
  const d = new Date(year, month - 1, day, h, min, 0, 0);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function extractArticleBody(html: string): string {
  const $ = cheerio.load(html);
  const root = $("div.article_body").first();
  if (!root.length) {
    const alt = $("article#uamods div").filter((_, el) => {
      const cls = $(el).attr("class") ?? "";
      return /yjSlinkDirectlink|highLightSearchTarget/.test(cls);
    });
    if (alt.length) {
      const t = alt.first().text().trim();
      if (t.length > 40) return normalizeBodyText(t);
    }
    return "";
  }
  const block = root.clone();
  block.find("section").remove();
  block.find("script, style, noscript").remove();
  return normalizeBodyText(block.text());
}

function normalizeBodyText(raw: string): string {
  let t = raw.replace(/\u00a0/g, " ");
  t = t
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
  return t.replace(/\n{3,}/g, "\n\n").trim();
}

async function fetchArticleBody(url: string): Promise<string> {
  try {
    const html = await fetchHtml(url);
    return extractArticleBody(html);
  } catch {
    return "";
  }
}

async function attachBodies(items: NewsItem[]): Promise<void> {
  let idx = 0;
  async function worker(): Promise<void> {
    while (idx < items.length) {
      const i = idx++;
      const item = items[i]!;
      item.body = await fetchArticleBody(item.url);
    }
  }
  const workers = Array.from({ length: BODY_FETCH_CONCURRENCY }, () =>
    worker(),
  );
  await Promise.all(workers);
}

function outletFromListAnchor($: CheerioLoaded, el: cheerio.Element): string {
  const $a = $(el);
  const $time = $a.find("time").first();
  if (!$time.length) return "";
  const $row = $time.parent();
  let t = $row.children("span").first().text().trim().replace(/\s+/g, " ");
  if (t) return t;
  t = $time.closest("div").find("> span").first().text().trim().replace(/\s+/g, " ");
  return t;
}

function titleFromYahooListAnchor($: CheerioLoaded, el: cheerio.Element): string {
  const $a = $(el);
  const bodyRoot = $a.find(".newsFeed_item_body").first();
  if (bodyRoot.length) {
    const col = bodyRoot.children().last();
    const head = col.children().first();
    const t = head.text().trim().replace(/\s+/g, " ");
    if (t.length >= 3) return t;
  }
  const fromP = $a.find("p").first().text().trim();
  if (fromP.length >= 3) return fromP.replace(/\s+/g, " ");
  const fromTitle = ($a.attr("title") ?? "").trim();
  if (fromTitle.length >= 3) return fromTitle.replace(/\s+/g, " ");
  return "";
}

function pushArticleFromSearchAnchor(
  $: CheerioLoaded,
  el: cheerio.Element,
  seen: Set<string>,
  out: NewsItem[],
  fallbackTime: string,
): void {
  const $a = $(el);
  const url = canonicalArticleUrl($a.attr("href") ?? "");
  if (!url || seen.has(url)) return;
  const title = titleFromYahooListAnchor($, el);
  if (title.length < 3) return;

  seen.add(url);
  let publishedAt: string | undefined;
  const timeEl = $a.find("time").first();
  const dt = timeEl.attr("datetime");
  if (dt) {
    const d = new Date(dt);
    if (!Number.isNaN(d.getTime())) publishedAt = d.toISOString();
  }
  if (!publishedAt) {
    publishedAt = parseYahooSearchListTime(timeEl.text());
  }

  out.push({
    title,
    url,
    body: "",
    source: "yahoo",
    outlet: outletFromListAnchor($, el),
    publishedAt: publishedAt ?? fallbackTime,
  });
}

function pushArticleFromAnchor(
  $: CheerioLoaded,
  el: cheerio.Element,
  seen: Set<string>,
  out: NewsItem[],
  withListTime: boolean,
  fallbackTime: string,
): void {
  const $a = $(el);
  const url = canonicalArticleUrl($a.attr("href") ?? "");
  if (!url || seen.has(url)) return;
  let title =
    $a.find("p").first().text().trim() ||
    ($a.attr("title") ?? "").trim() ||
    $a.text().trim();
  title = title.replace(/\s+/g, " ").trim();
  if (title.length < 3) return;

  seen.add(url);
  let publishedAt: string | undefined;
  if (withListTime) {
    const timeEl = $a.find("time").first();
    const dt = timeEl.attr("datetime");
    if (dt) {
      const d = new Date(dt);
      if (!Number.isNaN(d.getTime())) publishedAt = d.toISOString();
    }
    if (!publishedAt) {
      const spans = timeEl.find("span");
      if (spans.length >= 2) {
        publishedAt = parseYahooDateText(
          $(spans[0]!).text(),
          $(spans[1]!).text(),
        );
      }
    }
  }

  out.push({
    title,
    url,
    body: "",
    source: "yahoo",
    outlet: outletFromListAnchor($, el),
    publishedAt: publishedAt ?? fallbackTime,
  });
}

/** トップ: アクセスランキング優先 → 他カラムの記事リンク（/pickup は対象外） */
function collectFromMainPage(html: string, seen: Set<string>): NewsItem[] {
  const $ = cheerio.load(html);
  const out: NewsItem[] = [];
  const fallbackTime = new Date().toISOString();

  $("#accr a[href*='/articles/']").each((_, el) =>
    pushArticleFromAnchor($, el, seen, out, true, fallbackTime),
  );

  $("a[href*='/articles/']").each((_, el) => {
    if ($(el).closest("#accr").length) return;
    pushArticleFromAnchor($, el, seen, out, false, fallbackTime);
  });

  return out;
}

/** 指定カテゴリの Yahoo!ニュース一覧ページのみから収集 */
export async function scrapeYahooCategoryNews(
  category: YahooNewsCategory,
): Promise<NewsItem[]> {
  const seen = new Set<string>();
  const pageUrl = YAHOO_CATEGORY_URL[category];
  const html = await fetchHtml(pageUrl);
  const merged = collectFromMainPage(html, seen);
  const limited = merged.slice(0, MAX_ITEMS);
  await attachBodies(limited);
  return limited;
}

function normalizeSearchQuery(q: string): string {
  return q
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, YAHOO_SEARCH_QUERY_MAX_CHARS);
}

/** Yahoo!ニュース検索 (`/search?p=`) の結果から記事を収集 */
export async function scrapeYahooSearchNews(
  query: string,
): Promise<NewsItem[]> {
  const q = normalizeSearchQuery(query);
  if (!q) return [];

  const seen = new Set<string>();
  const pageUrl = `https://news.yahoo.co.jp/search?p=${encodeURIComponent(q)}&ei=utf-8`;
  const html = await fetchHtml(pageUrl);
  const $ = cheerio.load(html);
  const out: NewsItem[] = [];
  const fallbackTime = new Date().toISOString();

  $(".newsFeed_list a[href*='/articles/']").each((_, el) =>
    pushArticleFromSearchAnchor($, el, seen, out, fallbackTime),
  );

  if (!out.length) {
    $("a[href*='/articles/']").each((_, el) => {
      if ($(el).closest(".newsFeed").length)
        pushArticleFromSearchAnchor($, el, seen, out, fallbackTime);
    });
  }

  const limited = out.slice(0, MAX_ITEMS);
  await attachBodies(limited);
  return limited;
}

/** @deprecated 主要カテゴリのみ。`scrapeYahooCategoryNews("top")` と同じ */
export async function scrapeYahooNews(): Promise<NewsItem[]> {
  return scrapeYahooCategoryNews("top");
}

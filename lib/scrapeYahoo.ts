import * as cheerio from "cheerio";
import type { NewsItem } from "./types";
import { fetchHtml } from "./fetchHtml";
import { YAHOO_SEARCH_QUERY_MAX_CHARS } from "./yahooSearch";
import type { YahooNewsCategory } from "./yahooCategories";
import { YAHOO_CATEGORY_URL } from "./yahooCategories";
import {
  DEFAULT_NEWS_LIMIT,
  type NewsLimitOption,
} from "./newsLimit";
import type { YahooCategoryFeed } from "./yahooFeed";

type CheerioLoaded = ReturnType<typeof cheerio.load>;
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

/** 例: https://news.yahoo.co.jp/pickup/6575717 */
function canonicalPickupUrl(href: string): string | null {
  if (!href) return null;
  const abs = absolutizeYahoo(href.split("#")[0]!.split("?")[0]!);
  try {
    const u = new URL(abs);
    if (u.hostname !== "news.yahoo.co.jp") return null;
    const m = u.pathname.match(/^\/pickup\/(\d+)\/?$/i);
    if (!m) return null;
    return `https://news.yahoo.co.jp/pickup/${m[1]}`;
  } catch {
    return null;
  }
}

/** pickup ページ内の先頭記事リンクから正規化 URL を得る */
async function resolvePickupToArticleUrl(pickupUrl: string): Promise<string | null> {
  try {
    const html = await fetchHtml(pickupUrl);
    const $ = cheerio.load(html);
    const href = $('a[href*="/articles/"]').first().attr("href");
    if (!href) return null;
    return canonicalArticleUrl(href);
  } catch {
    return null;
  }
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

function orgNameFromLdAuthor(author: unknown): string {
  if (!author || typeof author !== "object") return "";
  const a = author as Record<string, unknown>;
  const types = a["@type"];
  const isOrg =
    types === "Organization" ||
    (Array.isArray(types) && types.includes("Organization"));
  if (!isOrg || typeof a.name !== "string") return "";
  return a.name.trim();
}

function outletFromNewsArticleLd(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const o = data as Record<string, unknown>;
  const graph = o["@graph"];
  if (Array.isArray(graph)) {
    for (const node of graph) {
      const t = outletFromSingleNewsArticleLd(node);
      if (t) return t;
    }
  }
  return outletFromSingleNewsArticleLd(data);
}

function outletFromSingleNewsArticleLd(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const o = data as Record<string, unknown>;
  const types = o["@type"];
  const isNews =
    types === "NewsArticle" ||
    (Array.isArray(types) && types.includes("NewsArticle"));
  if (!isNews) return "";
  const author = o.author;
  if (Array.isArray(author)) {
    for (const a of author) {
      const name = orgNameFromLdAuthor(a);
      if (name) return name;
    }
    return "";
  }
  return orgNameFromLdAuthor(author);
}

/** 記事ページの JSON-LD（NewsArticle.author）から配信元名を得る */
function extractOutletFromArticleHtml(html: string): string {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    const raw = $(scripts[i]!).html();
    if (!raw) continue;
    try {
      const data = JSON.parse(raw) as unknown;
      const outlet = outletFromNewsArticleLd(data);
      if (outlet) return outlet;
    } catch {
      /* ignore */
    }
  }
  return "";
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

async function fetchArticleBodyAndOutlet(
  url: string,
): Promise<{ body: string; outlet: string }> {
  try {
    const html = await fetchHtml(url);
    return {
      body: extractArticleBody(html),
      outlet: extractOutletFromArticleHtml(html),
    };
  } catch {
    return { body: "", outlet: "" };
  }
}

async function attachBodies(items: NewsItem[]): Promise<void> {
  let idx = 0;
  async function worker(): Promise<void> {
    while (idx < items.length) {
      const i = idx++;
      const item = items[i]!;
      const { body, outlet } = await fetchArticleBodyAndOutlet(item.url);
      item.body = body;
      if (!item.outlet && outlet) item.outlet = outlet;
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

/** サイドバー「アクセスランキング」（#accr）のみ */
function collectRankingFromMainPage(html: string, seen: Set<string>): NewsItem[] {
  const $ = cheerio.load(html);
  const out: NewsItem[] = [];
  const fallbackTime = new Date().toISOString();

  $("#accr a[href*='/articles/']").each((_, el) =>
    pushArticleFromAnchor($, el, seen, out, true, fallbackTime),
  );

  return out;
}

/** トピックス（#uamods-topics）は /pickup/ リンク → 各 pickup から記事 URL を解決 */
async function scrapeYahooCategoryTopicsNews(
  category: YahooNewsCategory,
  maxItems: NewsLimitOption,
): Promise<NewsItem[]> {
  const pageUrl = YAHOO_CATEGORY_URL[category];
  const html = await fetchHtml(pageUrl);
  const $ = cheerio.load(html);
  const fallbackTime = new Date().toISOString();
  const seenPickup = new Set<string>();
  const pending: { pickupUrl: string; title: string }[] = [];

  $("#uamods-topics a[href*='/pickup/']").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const canonical = canonicalPickupUrl(href);
    if (!canonical || seenPickup.has(canonical)) return;
    seenPickup.add(canonical);
    const title = $(el).text().trim().replace(/\s+/g, " ");
    if (title.length < 3) return;
    pending.push({ pickupUrl: canonical, title });
  });

  const maxAttempts = Math.min(Math.max(pending.length, maxItems + 5), 40);
  const toResolve = pending.slice(0, maxAttempts);

  const items: NewsItem[] = [];
  const seenArticle = new Set<string>();

  for (const job of toResolve) {
    if (items.length >= maxItems) break;
    const articleUrl = await resolvePickupToArticleUrl(job.pickupUrl);
    if (!articleUrl || seenArticle.has(articleUrl)) continue;
    seenArticle.add(articleUrl);
    items.push({
      title: job.title,
      url: articleUrl,
      body: "",
      source: "yahoo",
      outlet: "",
      publishedAt: fallbackTime,
    });
  }

  const limited = items.slice(0, maxItems);
  await attachBodies(limited);
  return limited;
}

/** 指定カテゴリの Yahoo!ニュース一覧ページのみから収集 */
export async function scrapeYahooCategoryNews(
  category: YahooNewsCategory,
  maxItems: NewsLimitOption = DEFAULT_NEWS_LIMIT,
  feed: YahooCategoryFeed = "topics",
): Promise<NewsItem[]> {
  if (feed === "topics") {
    return scrapeYahooCategoryTopicsNews(category, maxItems);
  }

  const seen = new Set<string>();
  const pageUrl = YAHOO_CATEGORY_URL[category];
  const html = await fetchHtml(pageUrl);
  const merged = collectRankingFromMainPage(html, seen);
  const limited = merged.slice(0, maxItems);
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
  maxItems: NewsLimitOption = DEFAULT_NEWS_LIMIT,
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

  const limited = out.slice(0, maxItems);
  await attachBodies(limited);
  return limited;
}

/** @deprecated 主要カテゴリのみ。`scrapeYahooCategoryNews("top")` と同じ */
export async function scrapeYahooNews(): Promise<NewsItem[]> {
  return scrapeYahooCategoryNews("top");
}

"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  useCallback,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { YahooNewsCategory } from "@/lib/yahooCategories";
import { CATEGORY_TABS } from "@/lib/yahooCategories";
import { NEWS_LIMIT_OPTIONS, type NewsLimitOption } from "@/lib/newsLimit";
import type { YahooCategoryFeed } from "@/lib/yahooFeed";
import { YAHOO_SEARCH_QUERY_MAX_CHARS } from "@/lib/yahooSearch";

const TAB_PATH: Record<YahooNewsCategory, string> = {
  top: "/top",
  domestic: "/domestic",
  world: "/world",
  it: "/it",
};

const DEFAULT_CATEGORY_PATH = TAB_PATH.world;

type Props = {
  activeCategory: YahooNewsCategory | null;
  searchFieldValue: string;
  limit: NewsLimitOption;
  /** `/search` のとき、URL の `q`（件数変更で引き継ぐ） */
  searchQueryForNav?: string;
  categoryFeed: YahooCategoryFeed;
  /** カテゴリ一覧のときだけ true（検索ページではトピックス切替を出さない） */
  showFeedSwitch: boolean;
};

export function CategoryNav({
  activeCategory,
  searchFieldValue,
  limit,
  searchQueryForNav = "",
  categoryFeed,
  showFeedSwitch,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const selectValue =
    activeCategory != null ? TAB_PATH[activeCategory] : DEFAULT_CATEGORY_PATH;

  const navigate = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router],
  );

  const buildCategoryHref = useCallback(
    (path: string) => {
      const sp = new URLSearchParams();
      sp.set("n", String(limit));
      if (categoryFeed === "ranking") sp.set("feed", "ranking");
      return `${path}?${sp.toString()}`;
    },
    [limit, categoryFeed],
  );

  const onCategoryChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const path = e.target.value;
      if (!path) return;
      if (path === pathname) return;
      navigate(buildCategoryHref(path));
    },
    [navigate, pathname, buildCategoryHref],
  );

  const onFeedChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value === "topics" ? "topics" : "ranking";
      const sp = new URLSearchParams();
      sp.set("n", String(limit));
      if (v === "ranking") sp.set("feed", "ranking");
      startTransition(() => {
        router.push(`${pathname}?${sp.toString()}`);
      });
    },
    [limit, pathname, router],
  );

  const onLimitChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const n = Number.parseInt(e.target.value, 10) as NewsLimitOption;
      const sp = new URLSearchParams();
      sp.set("n", String(n));
      const q = searchQueryForNav.trim();
      if (pathname === "/search" && q) {
        sp.set("q", q);
      } else if (showFeedSwitch && categoryFeed === "ranking") {
        sp.set("feed", "ranking");
      }
      startTransition(() => {
        if (pathname === "/search") {
          router.push(`/search?${sp.toString()}`);
        } else if (pathname === "/") {
          router.push(`/?${sp.toString()}`);
        } else {
          router.push(`${pathname}?${sp.toString()}`);
        }
      });
    },
    [pathname, router, searchQueryForNav, showFeedSwitch, categoryFeed],
  );

  const onSearchSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const raw = new FormData(e.currentTarget).get("q");
      const q = String(raw ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, YAHOO_SEARCH_QUERY_MAX_CHARS);
      if (!q) return;
      const nRaw = new FormData(e.currentTarget).get("n");
      const n = String(nRaw ?? limit);
      navigate(`/search?q=${encodeURIComponent(q)}&n=${encodeURIComponent(n)}`);
    },
    [navigate, limit],
  );

  return (
    <div className="relative border-b border-neutral-200 bg-white pb-2 pt-1">
      {isPending ? (
        <>
          <div
            className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 shadow-[0_0_12px_rgba(37,99,235,0.7)]"
            style={{
              animation: "navload 0.9s ease-in-out infinite",
            }}
            aria-hidden
          />
          <style>{`@keyframes navload { 0% { opacity: 0.55; } 50% { opacity: 1; } 100% { opacity: 0.55; } }`}</style>
          <div
            className="pointer-events-none fixed right-3 top-[3.25rem] z-[70] flex items-center gap-2 rounded-full border border-blue-200 bg-white/95 px-2.5 py-1.5 shadow-md"
            aria-live="polite"
          >
            <span className="sr-only">読み込み中</span>
            <span
              className="inline-block h-8 w-8 animate-spin rounded-full border-[4px] border-blue-100 border-t-blue-600"
              aria-hidden
            />
            <span className="text-xs font-semibold text-blue-800">読み込み中</span>
          </div>
        </>
      ) : null}

      <div className="mb-2 flex flex-row items-stretch gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor="category-select" className="sr-only">
            カテゴリ
          </label>
          <select
            id="category-select"
            value={selectValue}
            onChange={onCategoryChange}
            className="w-full rounded-md border border-neutral-300 bg-white px-2 py-2 text-sm text-neutral-900"
          >
            {CATEGORY_TABS.map(({ key, label, path }) => (
              <option key={key} value={path}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {showFeedSwitch ? (
          <div className="w-[9.5rem] shrink-0 sm:w-[11rem]">
            <label htmlFor="news-feed-source" className="sr-only">
              一覧の種類
            </label>
            <select
              id="news-feed-source"
              value={categoryFeed}
              onChange={onFeedChange}
              className="w-full rounded-md border border-neutral-300 bg-white px-1.5 py-2 text-xs text-neutral-900 sm:px-2 sm:text-sm"
              aria-label="一覧の種類"
            >
              <option value="topics">トピックス</option>
              <option value="ranking">アクセスランキング</option>
            </select>
          </div>
        ) : null}
      </div>

      <form
        onSubmit={onSearchSubmit}
        className="flex flex-wrap items-stretch gap-1.5"
        role="search"
        aria-label="Yahoo!ニュース検索"
      >
        <label htmlFor="news-search-q" className="sr-only">
          キーワード
        </label>
        <input
          id="news-search-q"
          key={searchFieldValue}
          name="q"
          type="search"
          enterKeyHint="search"
          placeholder="検索"
          defaultValue={searchFieldValue}
          maxLength={YAHOO_SEARCH_QUERY_MAX_CHARS}
          autoComplete="off"
          className="min-w-0 flex-1 basis-[55%] rounded-md border border-neutral-300 px-2 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
        />
        <label htmlFor="news-fetch-n" className="sr-only">
          取得件数
        </label>
        <select
          id="news-fetch-n"
          name="n"
          value={limit}
          onChange={onLimitChange}
          className="shrink-0 rounded-md border border-neutral-300 bg-white px-1.5 py-2 text-xs font-medium text-neutral-800 sm:text-sm"
          aria-label="取得件数"
        >
          {NEWS_LIMIT_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}件
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="shrink-0 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-800"
        >
          検索
        </button>
      </form>
    </div>
  );
}

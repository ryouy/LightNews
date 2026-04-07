"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { YahooNewsCategory } from "@/lib/yahooCategories";
import { CATEGORY_TABS } from "@/lib/yahooCategories";
import { YAHOO_SEARCH_QUERY_MAX_CHARS } from "@/lib/yahooSearch";

const TAB_PATH: Record<YahooNewsCategory, string> = {
  top: "/",
  domestic: "/domestic",
  world: "/world",
  it: "/it",
};

type Props = {
  activeCategory: YahooNewsCategory | null;
  searchFieldValue: string;
};

export function CategoryNav({ activeCategory, searchFieldValue }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [showSlowNav, setShowSlowNav] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setShowSlowNav(false);
      return;
    }
    const id = window.setTimeout(() => setShowSlowNav(true), 450);
    return () => window.clearTimeout(id);
  }, [isPending]);

  const selectValue =
    activeCategory != null ? TAB_PATH[activeCategory] : "";

  const navigate = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router],
  );

  const onCategoryChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const path = e.target.value;
      if (!path || path === pathname) return;
      navigate(path);
    },
    [navigate, pathname],
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
      navigate(`/search?q=${encodeURIComponent(q)}`);
    },
    [navigate],
  );

  return (
    <div className="relative border-b border-neutral-200 bg-white pb-2 pt-1">
      {showSlowNav ? (
        <div
          className="pointer-events-none absolute right-0 top-1 z-20 flex items-center gap-1"
          aria-live="polite"
        >
          <span className="sr-only">読み込み中</span>
          <span
            className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-600"
            aria-hidden
          />
        </div>
      ) : null}

      <label htmlFor="category-select" className="sr-only">
        カテゴリ
      </label>
      <select
        id="category-select"
        value={selectValue}
        onChange={onCategoryChange}
        className="mb-2 w-full rounded-md border border-neutral-300 bg-white px-2 py-2 text-sm text-neutral-900"
      >
        <option value="" hidden aria-label="検索中表示中" />
        {CATEGORY_TABS.map(({ key, label, path }) => (
          <option key={key} value={path}>
            {label}
          </option>
        ))}
      </select>

      <form
        onSubmit={onSearchSubmit}
        className="flex gap-1.5"
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
          placeholder="Yahoo!ニュースを検索"
          defaultValue={searchFieldValue}
          maxLength={YAHOO_SEARCH_QUERY_MAX_CHARS}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
        />
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

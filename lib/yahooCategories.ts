export type YahooNewsCategory = "top" | "domestic" | "world" | "it";

/** Yahoo!ニュース のカテゴリトップ URL */
export const YAHOO_CATEGORY_URL: Record<YahooNewsCategory, string> = {
  top: "https://news.yahoo.co.jp/",
  domestic: "https://news.yahoo.co.jp/categories/domestic",
  world: "https://news.yahoo.co.jp/categories/world",
  it: "https://news.yahoo.co.jp/categories/it",
};

export const CATEGORY_TABS: {
  key: YahooNewsCategory;
  label: string;
  path: string;
}[] = [
  { key: "world", label: "国際", path: "/world" },
  { key: "domestic", label: "国内", path: "/domestic" },
  { key: "it", label: "IT", path: "/it" },
  { key: "top", label: "主要", path: "/top" },
];

export function isYahooNewsCategory(s: string): s is YahooNewsCategory {
  return s === "top" || s === "domestic" || s === "world" || s === "it";
}

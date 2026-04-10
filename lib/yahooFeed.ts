/** カテゴリ一覧の取得元（検索結果には使わない） */
export type YahooCategoryFeed = "ranking" | "topics";

/** 既定はトピックス。アクセスランキングは `feed=ranking` */
export function parseYahooFeedParam(
  raw: string | string[] | undefined | null,
): YahooCategoryFeed {
  if (raw == null) return "topics";
  const s = Array.isArray(raw) ? raw[0] : raw;
  return s === "ranking" ? "ranking" : "topics";
}

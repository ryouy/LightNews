/** 取得件数（本文取得の回数もこれに比例） */
export const NEWS_LIMIT_OPTIONS = [5, 10, 15, 20, 25, 30] as const;

export type NewsLimitOption = (typeof NEWS_LIMIT_OPTIONS)[number];

export const DEFAULT_NEWS_LIMIT: NewsLimitOption = 10;

export function clampNewsLimit(n: number): NewsLimitOption {
  const x = Math.round(Number(n));
  if (!Number.isFinite(x)) return DEFAULT_NEWS_LIMIT;
  let best: NewsLimitOption = DEFAULT_NEWS_LIMIT;
  let bestD = Infinity;
  for (const o of NEWS_LIMIT_OPTIONS) {
    const d = Math.abs(o - x);
    if (d < bestD) {
      bestD = d;
      best = o;
    }
  }
  return best;
}

export function parseNewsLimitParam(
  raw: string | string[] | undefined | null,
): NewsLimitOption {
  if (raw == null) return DEFAULT_NEWS_LIMIT;
  const s = Array.isArray(raw) ? raw[0] : raw;
  return clampNewsLimit(Number.parseInt(String(s), 10));
}

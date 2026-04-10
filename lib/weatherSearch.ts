import axios from "axios";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Newslight/1.0";

const API = "https://weathernews.jp/onebox/api_search.cgi";

type ApiRow = {
  loc?: string;
  url?: string;
};

/** ウェザーニュースの地点検索API。先頭ヒットの onebox URL を返す */
export async function searchWeatherFirstHit(
  query: string,
): Promise<{ loc: string; sourceUrl: string } | null> {
  const q = query.replace(/\s+/g, " ").trim().slice(0, 80);
  if (!q) return null;

  try {
    const res = await axios.get<ApiRow[]>(API, {
      params: { query: q, lang: "ja" },
      timeout: 15000,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
        "Accept-Language": "ja,en;q=0.9",
      },
      responseType: "json",
    });
    const data = res.data;
    if (!Array.isArray(data) || data.length === 0) return null;
    const first = data[0];
    const path = first?.url;
    if (!path || typeof path !== "string") return null;

    const pathOnly = path.split("#")[0]!;
    const base =
      pathOnly.startsWith("http://") || pathOnly.startsWith("https://")
        ? pathOnly
        : `https://weathernews.jp${pathOnly.startsWith("/") ? "" : "/"}${pathOnly}`;

    const loc =
      typeof first.loc === "string" && first.loc.trim()
        ? first.loc.trim()
        : q;

    return { loc, sourceUrl: base };
  } catch {
    return null;
  }
}

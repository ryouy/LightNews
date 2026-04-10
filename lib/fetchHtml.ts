import axios from "axios";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/**
 * Yahoo!ニュースは CDN が HTML を長時間キャッシュしやすい。
 * 一覧・検索が「数時間古い」ように見えるのを防ぐため、
 * 同一オリジンに毎回ユニークなクエリを付けてキャッシュキーをずらす。
 */
function urlWithYahooCacheBust(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname !== "news.yahoo.co.jp") return url;
    u.searchParams.set("cb", String(Date.now()));
    return u.toString();
  } catch {
    return url;
  }
}

export async function fetchHtml(url: string): Promise<string> {
  const finalUrl = urlWithYahooCacheBust(url);

  const res = await axios.get<string>(finalUrl, {
    timeout: 15000,
    headers: {
      "User-Agent": USER_AGENT,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "ja,en;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Upgrade-Insecure-Requests": "1",
    },
    responseType: "text",
    maxRedirects: 5,
  });

  const data = res.data;
  if (typeof data !== "string" || data.length < 200) {
    throw new Error("empty or invalid response");
  }
  return data;
}

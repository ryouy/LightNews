import axios from "axios";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Newslight/1.0";

export async function fetchHtml(url: string): Promise<string> {
  const res = await axios.get<string>(url, {
    timeout: 15000,
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ja,en;q=0.9",
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

import * as cheerio from "cheerio";
import { fetchHtml } from "./fetchHtml";
import type { WeatherSnapshot, WeatherWeekDay } from "./typesWeather";

type CheerioLoaded = ReturnType<typeof cheerio.load>;
type CheerSel = ReturnType<CheerioLoaded>;

function normalizeIconUrl(src: string): string {
  const s = src.trim();
  if (!s) return "";
  if (s.startsWith("//")) return `https:${s}`;
  return s;
}

function ddTempText(dd: CheerSel): string {
  if (!dd.length) return "";
  return dd
    .clone()
    .children()
    .remove()
    .end()
    .text()
    .replace(/\s+/g, "")
    .trim();
}

function popFromDayCard($: CheerioLoaded, card: CheerSel): string {
  const cells = card.find("table.precipitation tbody td span").toArray();
  const parts: string[] = [];
  for (let i = 0; i < cells.length; i++) {
    const t = $(cells[i]!).text().replace(/\s+/g, "").trim();
    if (t && t !== "%") parts.push(t);
  }
  if (!parts.length) return "";
  return parts.join(" / ");
}

function parseDayCard($: CheerioLoaded, card: CheerSel) {
  const summary =
    card.find(".info .status.pc").first().text().trim() ||
    card.find("figcaption.status").first().text().trim();
  const high = ddTempText(card.find(".temp .high dd").first());
  const low = ddTempText(card.find(".temp .low dd").first());
  const pop = popFromDayCard($, card);
  const iconUrl = normalizeIconUrl(
    card.find("img.wx__icon").first().attr("src") ?? "",
  );
  return {
    summary: summary.replace(/\s+/g, " ").trim(),
    high,
    low,
    pop,
    iconUrl,
  };
}

function parseWeekForecast($: CheerioLoaded): WeatherWeekDay[] {
  const rows = $('ul[id^="wx__week"]')
    .toArray()
    .map((el) => {
      const id = $(el).attr("id") ?? "";
      const m = /^wx__week(\d+)$/.exec(id);
      return { n: m ? Number(m[1]) : 9999, el };
    })
    .filter((x) => x.n < 9000)
    .sort((a, b) => a.n - b.n)
    .slice(0, 7);

  return rows.map(({ el }) => {
    const row = $(el);
    const dayNum = row.find(".date .day").first().text().trim();
    const dow = row.find(".date .dow").first().text().trim();
    const iconUrl = normalizeIconUrl(
      row.find("img.wx__icon").first().attr("src") ?? "",
    );
    const high = row
      .find(".high p")
      .first()
      .text()
      .replace(/\s+/g, "")
      .trim();
    const low = row
      .find(".low p")
      .first()
      .text()
      .replace(/\s+/g, "")
      .trim();
    const precip = row
      .find(".rain p")
      .first()
      .text()
      .replace(/\s+/g, "")
      .trim();
    return { dayNum, dow, iconUrl, high, low, precip };
  });
}

/** ウェザーニュース onebox 天気ページを取得 */
export async function scrapeWeathernews(url: string): Promise<WeatherSnapshot | null> {
  let html: string;
  try {
    html = await fetchHtml(url);
  } catch {
    return null;
  }
  const $ = cheerio.load(html);

  const headline = $("h1.title").first().text().replace(/\s+/g, " ").trim();
  const observedAt = $(".sun .time").first().text().replace(/\s+/g, " ").trim();

  const iconFig = $("figure.icon").first();
  const condition = iconFig.find("figcaption").first().text().trim();
  const observedIconUrl = normalizeIconUrl(
    iconFig.find("img").first().attr("src") ?? "",
  );

  let temperatureC = "";
  let humidityPct = "";
  let pressureHpa = "";
  let windMs = "";
  $("li.obs_block").each((_, el) => {
    const label = $(el).find(".title").first().text().trim();
    const val = $(el).find(".value").first().text().trim();
    const unit = $(el).find(".unit").first().text().trim();
    const combined = `${val}${unit}`.trim();
    if (label === "気温") temperatureC = combined;
    else if (label === "湿度") humidityPct = combined;
    else if (label === "気圧") pressureHpa = combined;
    else if (label === "風") windMs = combined;
  });

  const todayCard = $("#now__day");
  const tomorrowCard = todayCard.length ? todayCard.next(".card") : null;

  const today = todayCard.length
    ? parseDayCard($, todayCard)
    : { summary: "", high: "", low: "", pop: "", iconUrl: "" };
  const tomorrow =
    tomorrowCard && tomorrowCard.length
      ? parseDayCard($, tomorrowCard)
      : { summary: "", high: "", low: "", pop: "", iconUrl: "" };

  const week = parseWeekForecast($);

  if (!headline && !condition && !today.summary) {
    return null;
  }

  return {
    headline: headline || "天気",
    observedAt,
    condition: condition.replace(/\s+/g, " ").trim(),
    observedIconUrl,
    temperatureC,
    humidityPct,
    pressureHpa,
    windMs,
    todaySummary: today.summary,
    todayIconUrl: today.iconUrl,
    todayHigh: today.high,
    todayLow: today.low,
    todayPop: today.pop,
    tomorrowSummary: tomorrow.summary,
    tomorrowIconUrl: tomorrow.iconUrl,
    tomorrowHigh: tomorrow.high,
    tomorrowLow: tomorrow.low,
    tomorrowPop: tomorrow.pop,
    week,
    sourceUrl: url,
  };
}

export type WeatherSpotId = "aizu" | "kikugawa" | "niitsu" | "azumino";

export type WeatherSpot = {
  id: WeatherSpotId;
  /** タブ表示名 */
  label: string;
  /** 予報区の補足（任意） */
  sublabel?: string;
  /** ウェザーニュース onebox 天気予報ページ */
  sourceUrl: string;
};

/** 表示順: 会津若松、菊川、新津、安曇野 */
export const WEATHER_SPOTS: WeatherSpot[] = [
  {
    id: "aizu",
    label: "会津若松",
    sourceUrl: "https://weathernews.jp/onebox/tenki/fukushima/07202/",
  },
  {
    id: "kikugawa",
    label: "菊川",
    sourceUrl: "https://weathernews.jp/onebox/tenki/shizuoka/22224/",
  },
  {
    id: "niitsu",
    label: "新津",
    sourceUrl: "https://weathernews.jp/onebox/tenki/niigata/15105/",
  },
  {
    id: "azumino",
    label: "安曇野",
    sourceUrl: "https://weathernews.jp/onebox/tenki/nagano/20220/",
  },
];

export const DEFAULT_WEATHER_SPOT: WeatherSpotId = "aizu";

export function isWeatherSpotId(s: string): s is WeatherSpotId {
  return WEATHER_SPOTS.some((x) => x.id === s);
}

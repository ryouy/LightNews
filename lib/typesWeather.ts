/** 今日の1時間予報から間引いた 1 ポイント（約3時間ごと） */
export type WeatherHourlyPoint = {
  hour: string;
  iconUrl: string;
  rain: string;
  wind: string;
  tempC: number;
  tempLabel: string;
};

export type WeatherWeekDay = {
  dayNum: string;
  dow: string;
  iconUrl: string;
  high: string;
  low: string;
  /** 降水（ミリ・％などページ表記のまま） */
  precip: string;
};

export type WeatherSnapshot = {
  headline: string;
  observedAt: string;
  condition: string;
  observedIconUrl: string;
  temperatureC: string;
  humidityPct: string;
  pressureHpa: string;
  windMs: string;
  todaySummary: string;
  todayIconUrl: string;
  todayHigh: string;
  todayLow: string;
  /** 今日の降水確率（午前・午後など、取れた範囲） */
  todayPop: string;
  tomorrowSummary: string;
  tomorrowIconUrl: string;
  tomorrowHigh: string;
  tomorrowLow: string;
  tomorrowPop: string;
  /** 週間（wx__week0 〜 合計7日。無い場合は空） */
  week: WeatherWeekDay[];
  /** 今日の見出し（例: 4月7日 (火)）— 1日グラフ用 */
  todayBarTitle: string;
  /** あすの見出し（カードから。無ければ空） */
  tomorrowBarTitle: string;
  /** 今日・約3時間ごとの予報（1時間予報をサイト表記どおり間引き） */
  todayHourly3h: WeatherHourlyPoint[];
  sourceUrl: string;
};

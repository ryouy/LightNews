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
  sourceUrl: string;
};

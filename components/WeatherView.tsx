import { WeatherIcon } from "@/components/WeatherIcon";
import { WeatherLocationSearch } from "@/components/WeatherLocationSearch";
import { WeatherSpotNav } from "@/components/WeatherSpotNav";
import { WeatherTodayHourly } from "@/components/WeatherTodayHourly";
import { scrapeWeathernews } from "@/lib/scrapeWeathernews";
import type { WeatherSpotId } from "@/lib/weatherSpots";
import { WEATHER_SPOTS } from "@/lib/weatherSpots";

export type WeatherViewProps =
  | { spotId: WeatherSpotId; weatherSearchQuery?: string }
  | {
      custom: { sourceUrl: string; label: string };
      weatherSearchQuery: string;
    };

export async function WeatherView(props: WeatherViewProps) {
  const spot =
    "spotId" in props
      ? WEATHER_SPOTS.find((s) => s.id === props.spotId)!
      : null;
  const sourceUrl =
    "spotId" in props ? spot!.sourceUrl : props.custom.sourceUrl;
  const label =
    "spotId" in props ? spot!.label : props.custom.label;
  const sublabel = spot?.sublabel;
  const activeSpot: WeatherSpotId | null =
    "spotId" in props ? props.spotId : null;
  const weatherSearchQuery =
    "spotId" in props
      ? (props.weatherSearchQuery ?? "")
      : props.weatherSearchQuery;

  let data: Awaited<ReturnType<typeof scrapeWeathernews>> = null;
  try {
    data = await scrapeWeathernews(sourceUrl);
  } catch {
    /* 表示は続行 */
  }

  const header = (
    <header className="bg-white pt-1">
      <h1 className="sr-only">天気・{label}</h1>
      {sublabel ? (
        <p className="text-[11px] text-neutral-400">{sublabel}</p>
      ) : null}
      <WeatherLocationSearch initialQuery={weatherSearchQuery} />
      <WeatherSpotNav active={activeSpot} />
    </header>
  );

  if (!data) {
    return (
      <div className="mx-auto flex min-h-full max-w-lg flex-col px-3 pb-6 pt-1">
        {header}
        <p className="py-6 text-center text-xs text-neutral-600">
          取得できませんでした。しばらくしてから再読み込みしてください。
        </p>
      </div>
    );
  }

  const metricsLine = [
    data.humidityPct ? `湿度 ${data.humidityPct}` : "",
    data.windMs ? `風 ${data.windMs}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const todayDateLabel =
    data.todayBarTitle.trim() ||
    (data.week[0] ? `${data.week[0].dayNum}${data.week[0].dow}` : "");
  const tomorrowDateLabel =
    data.tomorrowBarTitle.trim() ||
    (data.week[1] ? `${data.week[1].dayNum}${data.week[1].dow}` : "");

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-3 pb-6 pt-1">
      {header}
      <div className="mt-2 min-w-0 space-y-0 text-neutral-800">
        <section className="pb-3">
          {data.headline ? (
            <p className="text-[11px] text-neutral-500">{data.headline}</p>
          ) : null}
          {data.observedAt ? (
            <p className="mt-1 inline-block rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold tabular-nums text-blue-800">
              {data.observedAt}
            </p>
          ) : null}
          <div className="mt-2 flex items-center gap-3">
            <WeatherIcon
              src={data.observedIconUrl}
              alt={data.condition || "天気"}
              size={56}
            />
            <div className="min-w-0 flex-1">
              {data.condition ? (
                <p className="text-base font-semibold leading-tight text-neutral-900">
                  {data.condition}
                </p>
              ) : null}
              {data.temperatureC ? (
                <p className="mt-0.5 text-xl font-semibold tabular-nums text-neutral-900">
                  {data.temperatureC}
                </p>
              ) : null}
            </div>
          </div>
          {metricsLine ? (
            <p className="mt-2 text-[10px] leading-relaxed text-neutral-500">
              {metricsLine}
            </p>
          ) : null}
        </section>

        <WeatherTodayHourly points={data.todayHourly3h} />

        {(data.todaySummary ||
          data.todayHigh ||
          data.tomorrowSummary ||
          data.tomorrowHigh) && (
          <section className="border-t border-neutral-200 pt-3">
            <div className="flex flex-row gap-2 sm:gap-3">
              {(data.todaySummary || data.todayHigh) && (
                <div className="flex min-w-0 flex-1 gap-2">
                  <WeatherIcon
                    src={data.todayIconUrl}
                    alt={data.todaySummary || "今日の天気"}
                    size={40}
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-neutral-500">
                      今日
                    </p>
                    {todayDateLabel ? (
                      <p className="mt-0.5 text-[10px] font-medium tabular-nums text-neutral-700">
                        {todayDateLabel}
                      </p>
                    ) : null}
                    {data.todaySummary ? (
                      <p className="mt-0.5 line-clamp-3 text-[11px] leading-snug text-neutral-800">
                        {data.todaySummary}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[10px] tabular-nums text-neutral-600 sm:text-[11px]">
                      {[
                        data.todayHigh && `高 ${data.todayHigh}`,
                        data.todayLow && `低 ${data.todayLow}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {data.todayPop ? (
                      <p className="mt-0.5 text-[9px] text-neutral-500 sm:text-[10px]">
                        降水 {data.todayPop}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
              {(data.tomorrowSummary || data.tomorrowHigh) && (
                <div className="flex min-w-0 flex-1 gap-2">
                  <WeatherIcon
                    src={data.tomorrowIconUrl}
                    alt={data.tomorrowSummary || "明日の天気"}
                    size={40}
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-neutral-500">
                      明日
                    </p>
                    {tomorrowDateLabel ? (
                      <p className="mt-0.5 text-[10px] font-medium tabular-nums text-neutral-700">
                        {tomorrowDateLabel}
                      </p>
                    ) : null}
                    {data.tomorrowSummary ? (
                      <p className="mt-0.5 line-clamp-3 text-[11px] leading-snug text-neutral-800">
                        {data.tomorrowSummary}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[10px] tabular-nums text-neutral-600 sm:text-[11px]">
                      {[
                        data.tomorrowHigh && `高 ${data.tomorrowHigh}`,
                        data.tomorrowLow && `低 ${data.tomorrowLow}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {data.tomorrowPop ? (
                      <p className="mt-0.5 text-[9px] text-neutral-500 sm:text-[10px]">
                        降水 {data.tomorrowPop}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {data.week.length > 0 ? (
          <section className="border-t border-neutral-200 pt-3">
            <h2 className="mb-2 text-[11px] font-medium text-neutral-500">
              1週間予報
            </h2>
            <div className="-mx-0.5 flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:thin]">
              {data.week.map((d, i) => (
                <div
                  key={`${d.dayNum}-${d.dow}-${i}`}
                  className="flex w-[3.75rem] shrink-0 flex-col items-center px-0.5 py-1 text-center"
                >
                  <p className="text-[10px] font-medium tabular-nums text-neutral-700">
                    {d.dayNum}
                    <span className="font-normal text-neutral-400">{d.dow}</span>
                  </p>
                  <WeatherIcon
                    src={d.iconUrl}
                    alt={`${d.dayNum}の天気`}
                    size={36}
                    className="my-0.5"
                  />
                  <p className="text-[9px] tabular-nums text-neutral-600">
                    <span className="text-neutral-800">{d.high}</span>
                    <span className="text-neutral-300">/</span>
                    <span>{d.low}</span>
                  </p>
                  {d.precip ? (
                    <p className="text-[9px] text-neutral-500">{d.precip}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

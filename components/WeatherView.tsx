import { WeatherIcon } from "@/components/WeatherIcon";
import { WeatherSpotNav } from "@/components/WeatherSpotNav";
import { scrapeWeathernews } from "@/lib/scrapeWeathernews";
import type { WeatherSpotId } from "@/lib/weatherSpots";
import { WEATHER_SPOTS } from "@/lib/weatherSpots";

type Props = { spotId: WeatherSpotId };

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/80 px-2.5 py-1.5 text-center shadow-sm ring-1 ring-neutral-100">
      <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-neutral-800">{value}</p>
    </div>
  );
}

export async function WeatherView({ spotId }: Props) {
  const spot = WEATHER_SPOTS.find((s) => s.id === spotId)!;
  let data: Awaited<ReturnType<typeof scrapeWeathernews>> = null;
  try {
    data = await scrapeWeathernews(spot.sourceUrl);
  } catch {
    /* 表示は続行 */
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-3 pb-8 pt-2">
      <header className="sticky top-0 z-10 bg-white">
        <h1 className="pt-1 text-base font-semibold text-neutral-900">天気</h1>
        {spot.sublabel ? (
          <p className="text-xs text-neutral-500">{spot.sublabel}</p>
        ) : null}
        <WeatherSpotNav active={spotId} />
      </header>

      {!data ? (
        <p className="py-8 text-center text-sm text-neutral-600">
          天気を取得できませんでした。しばらくしてから再読み込みしてください。
        </p>
      ) : (
        <div className="mt-3 space-y-4 text-neutral-800">
          {/* いま */}
          <section className="overflow-hidden rounded-2xl bg-gradient-to-b from-sky-50 to-white p-4 ring-1 ring-sky-100/80">
            <p className="text-[11px] font-medium text-sky-800/90">いまの天気</p>
            <p className="mt-0.5 text-xs text-neutral-500">{data.headline}</p>
            {data.observedAt ? (
              <p className="text-[11px] text-neutral-400">{data.observedAt}</p>
            ) : null}
            <div className="mt-3 flex items-center gap-4">
              <WeatherIcon
                src={data.observedIconUrl}
                alt={data.condition || "天気"}
                size={72}
                className="drop-shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold leading-tight text-neutral-900">
                  {data.condition || "—"}
                </p>
                {data.temperatureC ? (
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-sky-900">
                    {data.temperatureC}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {data.humidityPct ? (
                <MetricChip label="湿度" value={data.humidityPct} />
              ) : null}
              {data.pressureHpa ? (
                <MetricChip label="気圧" value={data.pressureHpa} />
              ) : null}
              {data.windMs ? (
                <MetricChip label="風" value={data.windMs} />
              ) : null}
            </div>
          </section>

          {/* きょう・あす */}
          {(data.todaySummary || data.todayHigh || data.tomorrowSummary || data.tomorrowHigh) && (
            <section>
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                きょう・あす
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {(data.todaySummary || data.todayHigh) && (
                  <div className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-3">
                    <WeatherIcon
                      src={data.todayIconUrl}
                      alt={data.todaySummary || "今日の天気"}
                      size={52}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-sky-700">きょう</p>
                      {data.todaySummary ? (
                        <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-neutral-900">
                          {data.todaySummary}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs tabular-nums text-neutral-600">
                        {[data.todayHigh && `高 ${data.todayHigh}`, data.todayLow && `低 ${data.todayLow}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {data.todayPop ? (
                        <p className="mt-1 text-[11px] text-neutral-500">
                          降水 {data.todayPop}
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}
                {(data.tomorrowSummary || data.tomorrowHigh) && (
                  <div className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-3">
                    <WeatherIcon
                      src={data.tomorrowIconUrl}
                      alt={data.tomorrowSummary || "明日の天気"}
                      size={52}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-indigo-700">あす</p>
                      {data.tomorrowSummary ? (
                        <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-neutral-900">
                          {data.tomorrowSummary}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs tabular-nums text-neutral-600">
                        {[
                          data.tomorrowHigh && `高 ${data.tomorrowHigh}`,
                          data.tomorrowLow && `低 ${data.tomorrowLow}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {data.tomorrowPop ? (
                        <p className="mt-1 text-[11px] text-neutral-500">
                          降水 {data.tomorrowPop}
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 7日 */}
          {data.week.length > 0 ? (
            <section>
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                このあと7日
              </h2>
              <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:thin]">
                {data.week.map((d, i) => (
                  <div
                    key={`${d.dayNum}-${d.dow}-${i}`}
                    className="flex w-[4.25rem] shrink-0 flex-col items-center rounded-xl border border-neutral-200 bg-white px-1.5 py-2 text-center"
                  >
                    <p className="text-[11px] font-semibold tabular-nums text-neutral-800">
                      {d.dayNum}
                      <span className="font-normal text-neutral-500">{d.dow}</span>
                    </p>
                    <WeatherIcon
                      src={d.iconUrl}
                      alt={`${d.dayNum}の天気`}
                      size={40}
                      className="my-1"
                    />
                    <p className="text-[10px] tabular-nums text-neutral-700">
                      <span className="font-medium text-rose-600">{d.high}</span>
                      <span className="text-neutral-300"> / </span>
                      <span className="text-sky-700">{d.low}</span>
                    </p>
                    {d.precip ? (
                      <p className="mt-0.5 text-[10px] text-neutral-500">{d.precip}</p>
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-neutral-400">
                降水は予報日によってミリまたは％で表示されます（ウェザーニュース表記どおり）
              </p>
            </section>
          ) : null}

          <p className="text-center text-[11px] text-neutral-400">
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-neutral-300 underline-offset-2"
            >
              ウェザーニュースで詳しく見る
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

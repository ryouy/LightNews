import { WeatherIcon } from "@/components/WeatherIcon";
import type { WeatherHourlyPoint } from "@/lib/typesWeather";

type Props = {
  points: WeatherHourlyPoint[];
};

/** 今日の約3時間ごと予報：時刻ごとの天気アイコンと気温・降水 */
export function WeatherTodayHourly({ points }: Props) {
  if (points.length === 0) return null;

  return (
    <section className="border-t border-neutral-200 pt-3">
      <h2 className="mb-2 text-[11px] font-medium text-neutral-500">今日</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(2.75rem,1fr))] gap-x-1 gap-y-2">
        {points.map((p, i) => (
          <div
            key={`${p.hour}-${i}`}
            className="flex min-w-0 flex-col items-center text-center"
          >
            <WeatherIcon
              src={p.iconUrl}
              alt={`${p.hour}時の天気`}
              size={32}
            />
            <p className="mt-0.5 text-[10px] font-semibold tabular-nums text-neutral-800">
              {p.hour}時
            </p>
            <p className="text-[10px] tabular-nums text-neutral-700">{p.tempLabel}</p>
            {p.rain ? (
              <p className="text-[9px] leading-tight text-neutral-500">{p.rain}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

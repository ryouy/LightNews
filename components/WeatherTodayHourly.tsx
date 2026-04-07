"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { WeatherIcon } from "@/components/WeatherIcon";
import type { WeatherHourlyPoint } from "@/lib/typesWeather";

type Props = {
  points: WeatherHourlyPoint[];
};

/** ローカル時刻の「時」と数値的にいちばん近いスロット（同距離ならより早い時刻側） */
function indexClosestHour(points: WeatherHourlyPoint[]): number {
  if (!points.length) return 0;
  const h = new Date().getHours();
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < points.length; i++) {
    const hh = parseInt(points[i]!.hour, 10);
    if (Number.isNaN(hh)) continue;
    const d = Math.abs(hh - h);
    if (d < bestDiff) {
      bestDiff = d;
      best = i;
    } else if (d === bestDiff) {
      const prevH = parseInt(points[best]!.hour, 10);
      if (!Number.isNaN(prevH) && hh < prevH) best = i;
    }
  }
  return best;
}

function scrollActiveToCenter(
  sc: HTMLDivElement,
  activeEl: HTMLElement,
): void {
  const left =
    activeEl.offsetLeft + activeEl.offsetWidth / 2 - sc.clientWidth / 2;
  sc.scrollLeft = Math.max(0, Math.min(left, sc.scrollWidth - sc.clientWidth));
}

/** 今日の約3時間ごと予報。現在に近いカードを枠で示し、横スクロールの中央に来るようにする */
export function WeatherTodayHourly({ points }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nearIndex, setNearIndex] = useState<number | null>(null);

  useLayoutEffect(() => {
    setNearIndex(points.length ? indexClosestHour(points) : null);
  }, [points]);

  useLayoutEffect(() => {
    if (nearIndex === null) return;
    const sc = scrollRef.current;
    if (!sc) return;
    const activeEl = sc.children.item(nearIndex) as HTMLElement | null;
    if (!activeEl) return;
    scrollActiveToCenter(sc, activeEl);
  }, [points, nearIndex]);

  if (points.length === 0) return null;

  return (
    <section className="border-t border-neutral-200 pt-3">
      <h2 className="mb-2 text-[11px] font-medium text-neutral-500">今日</h2>
      <div
        ref={scrollRef}
        className="-mx-0.5 flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:thin]"
      >
        {points.map((p, i) => {
          const isNear = nearIndex !== null && i === nearIndex;
          return (
            <div
              key={`${p.hour}-${i}`}
              className={
                isNear
                  ? "flex w-[3.75rem] shrink-0 flex-col items-center rounded-md border-2 border-blue-500 bg-blue-50/60 px-0.5 py-1 text-center"
                  : "flex w-[3.75rem] shrink-0 flex-col items-center border-2 border-transparent px-0.5 py-1 text-center"
              }
              aria-current={isNear ? "time" : undefined}
            >
              <WeatherIcon
                src={p.iconUrl}
                alt={`${p.hour}時の天気`}
                size={36}
                className="my-0.5"
              />
              <p className="text-[10px] font-semibold tabular-nums text-neutral-800">
                {p.hour}時
              </p>
              <p className="text-[9px] tabular-nums text-neutral-700">{p.tempLabel}</p>
              {p.rain ? (
                <p className="text-[9px] text-neutral-500">{p.rain}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

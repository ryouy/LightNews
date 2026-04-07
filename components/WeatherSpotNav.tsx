import Link from "next/link";
import type { WeatherSpotId } from "@/lib/weatherSpots";
import { WEATHER_SPOTS } from "@/lib/weatherSpots";

type Props = { active: WeatherSpotId };

export function WeatherSpotNav({ active }: Props) {
  return (
    <nav
      className="-mx-3 flex gap-0 overflow-x-auto border-b border-neutral-200 bg-white px-2"
      aria-label="地点"
    >
      {WEATHER_SPOTS.map(({ id, label }) => (
        <Link
          key={id}
          href={`/weather/${id}`}
          prefetch={false}
          className={
            active === id
              ? "shrink-0 border-b-2 border-blue-600 px-2.5 py-2 text-xs font-medium text-blue-600 no-underline"
              : "shrink-0 border-b-2 border-transparent px-2.5 py-2 text-xs text-neutral-600 no-underline hover:text-blue-600"
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

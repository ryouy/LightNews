import Link from "next/link";
import type { WeatherSpotId } from "@/lib/weatherSpots";
import { WEATHER_SPOTS } from "@/lib/weatherSpots";

type Props = { active: WeatherSpotId };

export function WeatherSpotNav({ active }: Props) {
  return (
    <nav
      className="-mx-3 flex gap-0.5 overflow-x-auto border-b border-neutral-200 bg-white px-3"
      aria-label="地点"
    >
      {WEATHER_SPOTS.map(({ id, label }) => (
        <Link
          key={id}
          href={`/weather/${id}`}
          prefetch={true}
          className={
            active === id
              ? "shrink-0 border-b-2 border-neutral-900 px-3 py-2.5 text-sm font-medium text-neutral-900 no-underline"
              : "shrink-0 border-b-2 border-transparent px-3 py-2.5 text-sm text-neutral-600 no-underline hover:text-neutral-900"
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

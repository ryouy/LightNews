import Link from "next/link";
import { redirect } from "next/navigation";
import { WeatherView } from "@/components/WeatherView";
import { searchWeatherFirstHit } from "@/lib/weatherSearch";
import { DEFAULT_WEATHER_SPOT } from "@/lib/weatherSpots";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

type Props = { searchParams: Promise<{ q?: string }> };

export default async function WeatherIndexPage({ searchParams }: Props) {
  const q = (await searchParams).q?.trim();
  if (!q) redirect(`/weather/${DEFAULT_WEATHER_SPOT}`);

  const hit = await searchWeatherFirstHit(q);
  if (!hit) {
    return (
      <div className="mx-auto max-w-lg px-3 py-8 text-center text-sm text-neutral-600">
        <p>「{q}」に該当する地点が見つかりませんでした。</p>
        <p className="mt-3">
          <Link
            href={`/weather/${DEFAULT_WEATHER_SPOT}`}
            className="font-medium text-blue-600 underline"
          >
            既定の地点へ
          </Link>
        </p>
      </div>
    );
  }

  return (
    <WeatherView
      custom={{ sourceUrl: hit.sourceUrl, label: hit.loc }}
      weatherSearchQuery={q}
    />
  );
}

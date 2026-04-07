import { notFound } from "next/navigation";
import { WeatherView } from "@/components/WeatherView";
import { isWeatherSpotId } from "@/lib/weatherSpots";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

type Props = { params: Promise<{ spot: string }> };

export default async function WeatherSpotPage({ params }: Props) {
  const { spot } = await params;
  if (!isWeatherSpotId(spot)) notFound();
  return <WeatherView spotId={spot} />;
}

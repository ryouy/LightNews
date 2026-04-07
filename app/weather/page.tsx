import { redirect } from "next/navigation";
import { DEFAULT_WEATHER_SPOT } from "@/lib/weatherSpots";

export default function WeatherIndexPage() {
  redirect(`/weather/${DEFAULT_WEATHER_SPOT}`);
}

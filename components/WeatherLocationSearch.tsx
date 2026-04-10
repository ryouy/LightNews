"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useState,
  useTransition,
  type FormEvent,
} from "react";

const MAX_LEN = 80;

type Props = {
  /** 現在の検索語（結果ページの表示用） */
  initialQuery?: string;
};

export function WeatherLocationSearch({ initialQuery = "" }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(initialQuery);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const q = value.replace(/\s+/g, " ").trim().slice(0, MAX_LEN);
      if (!q) return;
      startTransition(() => {
        router.push(`/weather?q=${encodeURIComponent(q)}`);
      });
    },
    [router, value],
  );

  return (
    <form
      onSubmit={onSubmit}
      className="mb-2 flex gap-1.5"
      role="search"
      aria-label="地点の天気を検索"
    >
      <label htmlFor="weather-loc-q" className="sr-only">
        地点
      </label>
      <input
        id="weather-loc-q"
        type="search"
        enterKeyHint="search"
        placeholder="都市名などで検索"
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, MAX_LEN))}
        maxLength={MAX_LEN}
        autoComplete="off"
        className="min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
      />
      <button
        type="submit"
        disabled={isPending}
        className="shrink-0 rounded-md border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        表示
      </button>
    </form>
  );
}

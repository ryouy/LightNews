"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteNav() {
  const pathname = usePathname();
  const isWeather = pathname.startsWith("/weather");

  const active =
    "flex-1 rounded-md bg-blue-600 py-2.5 text-center text-sm font-medium text-white no-underline";
  const idle =
    "flex-1 rounded-md py-2.5 text-center text-sm text-neutral-600 no-underline hover:bg-neutral-200/60 hover:text-blue-700";

  return (
    <nav
      className="border-b border-neutral-200 bg-white px-3 py-2"
      aria-label="表示の切り替え"
    >
      <div
        className="flex gap-1 rounded-lg border border-neutral-200 bg-neutral-100 p-0.5"
        role="tablist"
      >
        <Link
          href="/"
          role="tab"
          prefetch={false}
          aria-selected={!isWeather}
          aria-current={!isWeather ? "page" : undefined}
          className={!isWeather ? active : idle}
        >
          ニュース
        </Link>
        <Link
          href="/weather"
          role="tab"
          prefetch={false}
          aria-selected={isWeather}
          aria-current={isWeather ? "page" : undefined}
          className={isWeather ? active : idle}
        >
          天気
        </Link>
      </div>
    </nav>
  );
}

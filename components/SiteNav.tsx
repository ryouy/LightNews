"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteNav() {
  const pathname = usePathname();
  const isWeather = pathname.startsWith("/weather");

  return (
    <nav
      className="flex gap-4 border-b border-neutral-200 bg-white px-3 py-2 text-sm"
      aria-label="サイト内"
    >
      <Link
        href="/"
        className={
          !isWeather
            ? "font-semibold text-neutral-900 no-underline"
            : "text-neutral-600 no-underline hover:text-neutral-900"
        }
      >
        ニュース
      </Link>
      <Link
        href="/weather"
        className={
          isWeather
            ? "font-semibold text-neutral-900 no-underline"
            : "text-neutral-600 no-underline hover:text-neutral-900"
        }
      >
        天気
      </Link>
    </nav>
  );
}

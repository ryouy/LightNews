import Link from "next/link";
import type { YahooNewsCategory } from "@/lib/yahooCategories";
import { CATEGORY_TABS } from "@/lib/yahooCategories";

type Props = { active: YahooNewsCategory };

export function CategoryTabs({ active }: Props) {
  return (
    <nav
      className="-mx-3 flex gap-0.5 overflow-x-auto border-b border-neutral-200 bg-white px-3"
      aria-label="カテゴリ"
    >
      {CATEGORY_TABS.map(({ key, label, path }) => (
        <Link
          key={key}
          href={path}
          prefetch={true}
          className={
            active === key
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

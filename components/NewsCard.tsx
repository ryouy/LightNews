import { ArticleBodyDetails } from "@/components/ArticleBodyDetails";
import type { NewsItem } from "@/lib/types";

type Props = { item: NewsItem };

export function NewsCard({ item }: Props) {
  let time = "";
  try {
    time = new Intl.DateTimeFormat("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(item.publishedAt));
  } catch {
    /* ignore */
  }

  return (
    <article className="border-b border-neutral-200 py-3 last:border-b-0">
      {item.outlet ? (
        <p className="mb-0.5 text-[11px] leading-tight text-neutral-500">
          {item.outlet}
        </p>
      ) : null}
      <h2 className="text-sm font-medium leading-snug text-neutral-900">
        {item.title}
      </h2>
      {time ? (
        <p className="mt-1 text-xs text-neutral-500">{time}</p>
      ) : null}
      {item.body ? (
        <ArticleBodyDetails body={item.body} />
      ) : (
        <p className="mt-1.5 text-[11px] text-neutral-500">
          本文を取得できませんでした。
        </p>
      )}
    </article>
  );
}

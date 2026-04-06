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
      <h2 className="text-sm font-medium leading-snug text-neutral-900">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit hover:underline"
        >
          {item.title}
        </a>
      </h2>
      {time ? (
        <p className="mt-1 text-xs text-neutral-500">{time}</p>
      ) : null}
      {item.body ? (
        <details className="mt-2 rounded border border-neutral-100 bg-neutral-50/70">
          <summary className="cursor-pointer list-none px-2 py-1.5 text-[11px] text-neutral-600 [&::-webkit-details-marker]:hidden">
            <span className="underline decoration-neutral-300 underline-offset-1">
              本文を表示
            </span>
          </summary>
          <div className="max-h-40 overflow-y-auto border-t border-neutral-100 px-2 py-1.5">
            <p className="whitespace-pre-wrap text-[11px] leading-snug text-neutral-700">
              {item.body}
            </p>
          </div>
        </details>
      ) : (
        <p className="mt-1.5 text-[11px] text-neutral-500">
          本文を取得できませんでした（
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Yahoo!で読む
          </a>
          ）
        </p>
      )}
    </article>
  );
}

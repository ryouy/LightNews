import { CategoryTabs } from "@/components/CategoryTabs";
import { NewsCard } from "@/components/NewsCard";
import type { YahooNewsCategory } from "@/lib/yahooCategories";
import { scrapeYahooCategoryNews } from "@/lib/scrapeYahoo";

type Props = { category: YahooNewsCategory };

export async function NewsCategoryView({ category }: Props) {
  let items: Awaited<ReturnType<typeof scrapeYahooCategoryNews>> = [];
  try {
    items = await scrapeYahooCategoryNews(category);
  } catch {
    /* 取得失敗時もページ表示 */
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-3 pb-8 pt-2">
      <header className="sticky top-0 z-10 bg-white">
        <h1 className="pt-1 text-base font-semibold text-neutral-900">
          ニュース
        </h1>
        <CategoryTabs active={category} />
      </header>
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-600">
          ニュースを取得できませんでした。しばらくしてから再読み込みしてください。
        </p>
      ) : (
        <div className="divide-y divide-neutral-100">
          {items.map((item) => (
            <NewsCard key={item.url} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

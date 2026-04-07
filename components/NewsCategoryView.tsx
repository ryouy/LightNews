import { CategoryNav } from "@/components/CategoryNav";
import { NewsCard } from "@/components/NewsCard";
import {
  scrapeYahooCategoryNews,
  scrapeYahooSearchNews,
} from "@/lib/scrapeYahoo";
import {
  CATEGORY_TABS,
  type YahooNewsCategory,
} from "@/lib/yahooCategories";

type CategoryProps = { category: YahooNewsCategory };
type SearchProps = { searchQuery: string };

export type NewsCategoryViewProps = CategoryProps | SearchProps;

export async function NewsCategoryView(props: NewsCategoryViewProps) {
  let items: Awaited<ReturnType<typeof scrapeYahooCategoryNews>> = [];
  let activeCategory: YahooNewsCategory | null = null;
  let searchFieldValue = "";

  if ("searchQuery" in props) {
    searchFieldValue = props.searchQuery;
    const q = props.searchQuery.trim();
    activeCategory = null;
    if (q) {
      try {
        items = await scrapeYahooSearchNews(q);
      } catch {
        /* 取得失敗時もページ表示 */
      }
    }
  } else {
    activeCategory = props.category;
    try {
      items = await scrapeYahooCategoryNews(props.category);
    } catch {
      /* 取得失敗時もページ表示 */
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-3 pb-8 pt-2">
      <header className="sticky top-0 z-10 bg-white">
        {"searchQuery" in props ? (
          <h1 className="sr-only">
            {props.searchQuery.trim()
              ? `「${props.searchQuery.trim()}」の検索`
              : "検索"}
          </h1>
        ) : (
          <h1 className="sr-only">
            {CATEGORY_TABS.find((t) => t.key === props.category)?.label ??
              "ニュース"}
          </h1>
        )}
        <CategoryNav
          activeCategory={activeCategory}
          searchFieldValue={searchFieldValue}
        />
      </header>
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-600">
          {"searchQuery" in props && !props.searchQuery.trim()
            ? "キーワードを入力して、Yahoo!ニュースを検索できます。"
            : "searchQuery" in props && props.searchQuery.trim()
              ? "該当する記事が見つかりませんでした。別のキーワードで試すか、しばらくしてから再度お試しください。"
              : "ニュースを取得できませんでした。しばらくしてから再読み込みしてください。"}
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

import { NewsCategoryView } from "@/components/NewsCategoryView";
import { parseNewsLimitParam } from "@/lib/newsLimit";
import { parseYahooFeedParam } from "@/lib/yahooFeed";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

type Props = { searchParams: Promise<{ n?: string; feed?: string }> };

export default async function Home({ searchParams }: Props) {
  const sp = await searchParams;
  const n = parseNewsLimitParam(sp.n);
  const feed = parseYahooFeedParam(sp.feed);
  return (
    <NewsCategoryView category="world" limit={n} categoryFeed={feed} />
  );
}

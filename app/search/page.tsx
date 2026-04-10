import { NewsCategoryView } from "@/components/NewsCategoryView";
import { parseNewsLimitParam } from "@/lib/newsLimit";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

type Props = { searchParams: Promise<{ q?: string; n?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const n = parseNewsLimitParam(sp.n);
  return <NewsCategoryView searchQuery={q} limit={n} />;
}

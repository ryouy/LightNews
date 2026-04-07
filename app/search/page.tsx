import { NewsCategoryView } from "@/components/NewsCategoryView";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const q = (await searchParams).q ?? "";
  return <NewsCategoryView searchQuery={q} />;
}

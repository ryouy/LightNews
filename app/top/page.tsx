import { NewsCategoryView } from "@/components/NewsCategoryView";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

export default function TopNewsPage() {
  return <NewsCategoryView category="top" />;
}

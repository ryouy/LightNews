import { NewsCategoryView } from "@/components/NewsCategoryView";

export const revalidate = 300;
export const maxDuration = 60;

export default function WorldPage() {
  return <NewsCategoryView category="world" />;
}

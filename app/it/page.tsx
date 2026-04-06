import { NewsCategoryView } from "@/components/NewsCategoryView";

export const revalidate = 300;
export const maxDuration = 60;

export default function ItPage() {
  return <NewsCategoryView category="it" />;
}

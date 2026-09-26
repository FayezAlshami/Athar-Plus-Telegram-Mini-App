import { CategoryScreen } from "@/features/categories/category-screen";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryScreen slug={decodeURIComponent(slug)} />;
}

import { ProductScreen } from "@/features/products/product-screen";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductScreen idOrSlug={decodeURIComponent(id)} />;
}

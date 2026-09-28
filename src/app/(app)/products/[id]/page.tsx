import { decodeParam } from "@/lib/routing/decode-param";
import { ProductScreen } from "@/features/products/product-screen";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductScreen idOrSlug={decodeParam(id)} />;
}

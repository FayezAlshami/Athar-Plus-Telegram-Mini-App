import { decodeParam } from "@/lib/routing/decode-param";
import { OrderScreen } from "@/features/orders/order-screen";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderScreen id={decodeParam(id)} />;
}

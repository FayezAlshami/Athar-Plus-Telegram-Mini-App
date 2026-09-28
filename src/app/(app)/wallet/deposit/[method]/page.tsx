import { decodeParam } from "@/lib/routing/decode-param";
import { DepositMethodScreen } from "@/features/deposits/deposit-method-screen";

export default async function Page({ params }: { params: Promise<{ method: string }> }) {
  const { method } = await params;
  return <DepositMethodScreen code={decodeParam(method)} />;
}

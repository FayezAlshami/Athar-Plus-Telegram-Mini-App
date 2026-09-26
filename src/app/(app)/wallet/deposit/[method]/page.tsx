import { DepositMethodScreen } from "@/features/deposits/deposit-method-screen";

export default async function Page({ params }: { params: Promise<{ method: string }> }) {
  const { method } = await params;
  return <DepositMethodScreen code={decodeURIComponent(method)} />;
}

import { CampaignScreen } from "@/features/campaigns/campaign-screen";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CampaignScreen slug={decodeURIComponent(slug)} />;
}

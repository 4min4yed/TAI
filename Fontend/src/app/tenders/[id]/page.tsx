import TenderDetailView from "@/components/tender/TenderDetailView";
import AppLayout from "@/components/layout/AppLayout";

export default function TenderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <AppLayout>
      <TenderDetailView />
    </AppLayout>
  );
}

import DashboardTabs from "@/components/dashboard/DashboardTabs";
import AppLayout from "@/components/layout/AppLayout";

export default function HomePage() {
  return (
    <AppLayout title="Dashboard">
      <DashboardTabs />
    </AppLayout>
  );
}

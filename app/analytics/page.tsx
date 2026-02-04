import { requireAuth } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AnalyticsPageContent } from "@/components/analytics/analytics-page";

export default async function AnalyticsPage() {
  await requireAuth();

  return (
    <DashboardLayout>
      <AnalyticsPageContent />
    </DashboardLayout>
  );
}

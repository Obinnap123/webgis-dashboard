import { requireAuth } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardCrmOverview } from "@/components/dashboard/crm-overview";

export default async function DashboardPage() {
  await requireAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Executive view of operations, performance, and ticket health
          </p>
        </div>

        <DashboardCrmOverview />
      </div>
    </DashboardLayout>
  );
}

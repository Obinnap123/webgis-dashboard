import { requireAuth } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardStatsCards } from "@/components/dashboard/stats-cards";
import { RecentTickets } from "@/components/dashboard/recent-tickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  await requireAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your service tickets and system statistics
          </p>
        </div>

        <DashboardStatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTickets />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Response Time</span>
                    <span className="text-emerald-500 font-medium">Good</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div className="h-2 w-[95%] rounded-full bg-emerald-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Database</span>
                    <span className="text-emerald-500 font-medium">Healthy</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div className="h-2 w-[98%] rounded-full bg-emerald-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">API Uptime</span>
                    <span className="text-emerald-500 font-medium">99.9%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div className="h-2 w-[99.9%] rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

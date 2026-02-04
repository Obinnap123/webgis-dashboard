"use client";

import { useState } from "react";
import { AnalyticsOverviewPanel } from "@/components/analytics/overview";
import { AgentPerformanceAnalytics } from "@/components/analytics/agent-performance";
import { TicketAnalyticsPanel } from "@/components/analytics/ticket-analytics";
import { Button } from "@/components/ui/button";

export function AnalyticsPageContent() {
  const [rangeDays, setRangeDays] = useState<30 | 90 | 180>(90);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Operational insights from live ticket activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Range</span>
          <Button
            type="button"
            size="sm"
            variant={rangeDays === 30 ? "default" : "outline"}
            onClick={() => setRangeDays(30)}
          >
            30d
          </Button>
          <Button
            type="button"
            size="sm"
            variant={rangeDays === 90 ? "default" : "outline"}
            onClick={() => setRangeDays(90)}
          >
            90d
          </Button>
          <Button
            type="button"
            size="sm"
            variant={rangeDays === 180 ? "default" : "outline"}
            onClick={() => setRangeDays(180)}
          >
            180d
          </Button>
        </div>
      </div>

      <AnalyticsOverviewPanel rangeDays={rangeDays} />

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Ticket Analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            Creation patterns, peak periods, and resolution trends.
          </p>
        </div>
        <TicketAnalyticsPanel rangeDays={rangeDays} />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Agent Performance Analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            Compare workload, resolution speed, and productivity trends.
          </p>
        </div>
        <AgentPerformanceAnalytics rangeDays={rangeDays} />
      </div>
    </div>
  );
}

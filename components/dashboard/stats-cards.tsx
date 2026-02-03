"use client";

import { useEffect, useState } from "react";
import { DashboardStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export function DashboardStatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const response = await fetch("/api/dashboard/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!stats) {
    return <div>Failed to load statistics</div>;
  }

  const statCards = [
    {
      label: "Total Tickets",
      value: stats.totalTickets,
      icon: Ticket,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Open Tickets",
      value: stats.openTickets,
      icon: AlertCircle,
      color: "bg-red-100 text-red-600",
    },
    {
      label: "In Progress",
      value: stats.inProgressTickets,
      icon: TrendingUp,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Resolved",
      value: stats.resolvedTickets,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Avg Resolution",
      value: `${stats.avgResolutionTime}h`,
      icon: Clock,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
              <div className={`p-2 rounded-full bg-primary/10 text-primary`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

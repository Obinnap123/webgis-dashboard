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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

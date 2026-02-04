"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { DashboardOverview } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Ticket,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Timer,
  TrendingUp,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#f97316",
  IN_PROGRESS: "#0ea5e9",
  RESOLVED: "#22c55e",
  CLOSED: "#64748b",
  UNKNOWN: "#94a3b8",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#60a5fa",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
  URGENT: "#7c3aed",
  UNKNOWN: "#94a3b8",
};

const ACTION_STYLES: Record<string, { label: string; className: string }> = {
  created: { label: "Created", className: "bg-blue-100 text-blue-800" },
  assigned: { label: "Assigned", className: "bg-purple-100 text-purple-800" },
  status_changed: {
    label: "Status updated",
    className: "bg-amber-100 text-amber-800",
  },
  commented: { label: "Commented", className: "bg-emerald-100 text-emerald-800" },
};

const KPI_CARDS = [
  { key: "totalTickets", label: "Total Tickets", icon: Ticket, accent: "text-blue-600" },
  { key: "openTickets", label: "Open Tickets", icon: AlertCircle, accent: "text-amber-600" },
  { key: "inProgressTickets", label: "In Progress", icon: TrendingUp, accent: "text-sky-600" },
  { key: "resolvedTickets", label: "Resolved", icon: CheckCircle2, accent: "text-emerald-600" },
  { key: "avgResolutionHours", label: "Avg Resolution (hrs)", icon: Timer, accent: "text-indigo-600" },
];

function formatShortDate(label: any) {
  if (!label) return "";
  const date = label instanceof Date ? label : new Date(String(label));
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatWeekDate(label: any) {
  if (!label) return "";
  const date = label instanceof Date ? label : new Date(String(label));
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDateTime(dateValue: string) {
  const date = new Date(dateValue);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DashboardCrmOverview() {
  const router = useRouter();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [volumeRange, setVolumeRange] = useState<7 | 30>(30);
  const [trendRange, setTrendRange] = useState<4 | 12>(12);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/dashboard/overview");
        const payload = await response.json();
        if (payload.success) {
          setData(payload.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard overview:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const volumeData = useMemo(() => {
    if (!data) return [];
    return data.ticketVolume.slice(-volumeRange);
  }, [data, volumeRange]);

  const trendData = useMemo(() => {
    if (!data) return [];
    return data.resolutionTrends.slice(-trendRange);
  }, [data, trendRange]);

  const statusTotal = useMemo(() => {
    if (!data) return 0;
    return data.ticketsByStatus.reduce((acc, item) => acc + item.count, 0);
  }, [data]);

  const priorityTotal = useMemo(() => {
    if (!data) return 0;
    return data.ticketsByPriority.reduce((acc, item) => acc + item.count, 0);
  }, [data]);

  const tooltipStyles = {
    contentStyle: {
      background: "hsl(var(--background))",
      border: "1px solid hsl(var(--border))",
      borderRadius: 8,
    },
    labelStyle: { color: "hsl(var(--foreground))", fontWeight: 600 },
    itemStyle: { color: "hsl(var(--foreground))" },
  } as const;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading dashboard insights...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        No dashboard data available yet.
      </div>
    );
  }

  function goToStatus(status: string) {
    router.push(`/tickets?status=${encodeURIComponent(status)}`);
  }

  function goToPriority(priority: string) {
    router.push(`/tickets?priority=${encodeURIComponent(priority)}`);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          const value = (data.kpis as any)[card.key];
          return (
            <Card key={card.key} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{card.label}</span>
                  <Icon className={`h-4 w-4 ${card.accent}`} />
                </div>
                <div className="text-2xl font-semibold">{value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Ticket Volume Trend</CardTitle>
              <p className="text-sm text-muted-foreground">
                Intake velocity across the selected time range.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={volumeRange === 7 ? "default" : "outline"}
                size="sm"
                onClick={() => setVolumeRange(7)}
              >
                7 days
              </Button>
              <Button
                type="button"
                variant={volumeRange === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setVolumeRange(30)}
              >
                30 days
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatShortDate} />
                <YAxis allowDecimals={false} />
                <Tooltip labelFormatter={formatShortDate} {...tooltipStyles} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  fill="rgba(37, 99, 235, 0.15)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3">
            <div>
              <CardTitle>Resolution Tempo</CardTitle>
              <p className="text-sm text-muted-foreground">
                Average hours to resolve tickets weekly.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={trendRange === 4 ? "default" : "outline"}
                size="sm"
                onClick={() => setTrendRange(4)}
              >
                4 weeks
              </Button>
              <Button
                type="button"
                variant={trendRange === 12 ? "default" : "outline"}
                size="sm"
                onClick={() => setTrendRange(12)}
              >
                12 weeks
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-64 md:h-80">
            <div className="flex h-full flex-col justify-between gap-6">
              <div>
                <div className="text-3xl font-semibold">
                  {data.kpis.avgResolutionHours}h
                </div>
                <p className="text-sm text-muted-foreground">
                  Average resolution time
                </p>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <XAxis dataKey="period" tickFormatter={formatWeekDate} hide />
                    <YAxis hide />
                    <Tooltip labelFormatter={formatWeekDate} {...tooltipStyles} />
                    <Line
                      type="monotone"
                      dataKey="avgHours"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground">
                Latest period:{" "}
                <span className="font-medium text-foreground">
                  {trendData[trendData.length - 1]?.avgHours ?? 0}h
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Distribution By Status</CardTitle>
            <p className="text-sm text-muted-foreground">
              Current workflow breakdown across the queue.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-3 overflow-hidden rounded-full bg-muted">
              {data.ticketsByStatus.map((entry) => {
                const percent = statusTotal
                  ? Math.round((entry.count / statusTotal) * 100)
                  : 0;
                return (
                  <div
                    key={entry.status}
                    className="h-full"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: STATUS_COLORS[entry.status] || "#94a3b8",
                    }}
                  />
                );
              })}
            </div>
            <div className="space-y-3">
              {data.ticketsByStatus.map((entry) => {
                const percent = statusTotal
                  ? Math.round((entry.count / statusTotal) * 100)
                  : 0;
                return (
                  <button
                    key={entry.status}
                    type="button"
                    onClick={() => goToStatus(entry.status)}
                    className="flex w-full items-center justify-between text-sm text-left rounded-md px-2 py-1 hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: STATUS_COLORS[entry.status] || "#94a3b8",
                        }}
                      />
                      <span className="font-medium">{entry.status}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {entry.count} · {percent}%
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Distribution By Priority</CardTitle>
            <p className="text-sm text-muted-foreground">
              Identify the severity mix at a glance.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.ticketsByPriority.map((entry) => {
              const percent = priorityTotal
                ? Math.round((entry.count / priorityTotal) * 100)
                : 0;
              return (
                <button
                  key={entry.priority}
                  type="button"
                  onClick={() => goToPriority(entry.priority)}
                  className="space-y-2 text-left w-full rounded-md px-2 py-1 hover:bg-accent"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{entry.priority}</span>
                    <span className="text-muted-foreground">
                      {entry.count} · {percent}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: PRIORITY_COLORS[entry.priority] || "#94a3b8",
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Team Performance Overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              Assigned workload, resolutions, and open backlog by agent.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.agentPerformance.map((agent) => {
                const resolveRate = agent.assigned
                  ? Math.round((agent.resolved / agent.assigned) * 100)
                  : 0;
                return (
                  <div key={agent.agentId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">{agent.agentName}</div>
                        <div className="text-xs text-muted-foreground">
                          {agent.resolved} resolved · {agent.open} open
                        </div>
                      </div>
                      <div className="text-sm font-medium">{resolveRate}%</div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${resolveRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {data.agentPerformance.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No team performance data available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest ticket updates from the team.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentActivities.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No recent activity to display.
              </div>
            )}
            {data.recentActivities.map((activity) => {
              const action = ACTION_STYLES[activity.action] || {
                label: activity.action,
                className: "bg-gray-100 text-gray-800",
              };
              return (
                <div
                  key={activity.id}
                  className="flex gap-3 rounded-lg border border-border p-4"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className={action.className}>{action.label}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(activity.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {activity.ticket.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.user.name || activity.user.email} updated the ticket.
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

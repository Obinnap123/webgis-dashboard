"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { AnalyticsOverview } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  Ticket,
  CheckCircle2,
  AlertTriangle,
  Timer,
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

const SUMMARY_CARDS = [
  {
    id: "total",
    label: "Total Tickets",
    icon: Ticket,
    accent: "text-blue-600",
  },
  {
    id: "open",
    label: "Open Tickets",
    icon: AlertTriangle,
    accent: "text-amber-600",
  },
  {
    id: "resolved",
    label: "Resolved Tickets",
    icon: CheckCircle2,
    accent: "text-emerald-600",
  },
  {
    id: "avg",
    label: "Avg Resolution (hrs)",
    icon: Timer,
    accent: "text-indigo-600",
  },
  {
    id: "trend",
    label: "Last 30 Days",
    icon: TrendingUp,
    accent: "text-slate-600",
  },
];

function formatShortDate(label: any) {
  if (!label) return "";
  const date = label instanceof Date ? label : new Date(String(label));
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatMonthDay(label: any) {
  if (!label) return "";
  const date = label instanceof Date ? label : new Date(String(label));
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function AnalyticsOverviewPanel({ rangeDays = 90 }: { rangeDays?: number }) {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [volumeRange, setVolumeRange] = useState<7 | 30>(30);
  const [trendRange, setTrendRange] = useState<4 | 12>(12);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/analytics/overview?rangeDays=${rangeDays}`);
        const payload = await response.json();
        if (payload.success) {
          setData(payload.data);
        }
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [rangeDays]);

  const summaryValues = useMemo(() => {
    if (!data) return null;
    const avgResolution =
      data.totals.resolvedTickets > 0
        ? Math.round(
            data.resolutionTrends.reduce((acc, item) => acc + item.avgHours, 0) /
              Math.max(data.resolutionTrends.length, 1),
          )
        : 0;
    const lastThirty = data.ticketVolume.reduce((acc, item) => acc + item.count, 0);
    return {
      total: data.totals.totalTickets,
      open: data.totals.openTickets,
      resolved: data.totals.resolvedTickets,
      avg: avgResolution,
      trend: `${lastThirty} tickets`,
    };
  }, [data]);

  const volumeData = useMemo(() => {
    if (!data) return [];
    return data.ticketVolume.slice(-volumeRange);
  }, [data, volumeRange]);

  const trendData = useMemo(() => {
    if (!data) return [];
    return data.resolutionTrends.slice(-trendRange);
  }, [data, trendRange]);

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
    return <div className="text-sm text-muted-foreground">Loading analytics...</div>;
  }

  if (!data || !summaryValues) {
    return <div className="text-sm text-muted-foreground">No analytics data found.</div>;
  }

  function handleStatusClick(entry: any) {
    const status = entry?.payload?.status || entry?.status;
    if (!status) return;
    router.push(`/tickets?status=${encodeURIComponent(status)}`);
  }

  function handlePriorityClick(entry: any) {
    const priority = entry?.payload?.priority || entry?.priority;
    if (!priority) return;
    router.push(`/tickets?priority=${encodeURIComponent(priority)}`);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {SUMMARY_CARDS.map((card) => {
          const Icon = card.icon;
          const value = (summaryValues as any)[card.id];
          return (
            <Card key={card.id} className="transition-shadow hover:shadow-md">
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
              <CardTitle>Ticket Volume Over Time</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track how ticket intake changes day to day.
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
          <CardContent className="h-56 sm:h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatShortDate} />
                <YAxis allowDecimals={false} />
                <Tooltip labelFormatter={formatShortDate} {...tooltipStyles} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets By Status</CardTitle>
            <p className="text-sm text-muted-foreground">
              Current distribution across workflow stages.
            </p>
          </CardHeader>
          <CardContent className="h-56 sm:h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.ticketsByStatus}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={50}
                  outerRadius={90}
                  label
                  onClick={handleStatusClick}
                >
                  {data.ticketsByStatus.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] || "#94a3b8"}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyles} />
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tickets By Priority</CardTitle>
            <p className="text-sm text-muted-foreground">
              See how urgent the queue looks at a glance.
            </p>
          </CardHeader>
          <CardContent className="h-56 sm:h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ticketsByPriority} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis allowDecimals={false} />
                <Tooltip {...tooltipStyles} />
                <Bar dataKey="count" fill="#7c3aed" onClick={handlePriorityClick}>
                  {data.ticketsByPriority.map((entry) => (
                    <Cell
                      key={entry.priority}
                      fill={PRIORITY_COLORS[entry.priority] || "#94a3b8"}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Resolution Time Trends (Weekly)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track average resolution time week over week.
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
          <CardContent className="h-56 sm:h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tickFormatter={formatMonthDay} />
                <YAxis />
                <Tooltip labelFormatter={formatMonthDay} {...tooltipStyles} />
                <Line
                  type="monotone"
                  dataKey="avgHours"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Assigned workload, resolutions, and open backlog by agent.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Resolved</TableHead>
                  <TableHead>Open</TableHead>
                  <TableHead>Avg Resolution (hrs)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.agentPerformance.map((agent) => (
                  <TableRow key={agent.agentId}>
                    <TableCell className="font-medium">{agent.agentName}</TableCell>
                    <TableCell>{agent.assigned}</TableCell>
                    <TableCell>{agent.resolved}</TableCell>
                    <TableCell>{agent.open}</TableCell>
                    <TableCell>{agent.avgResolutionHours}</TableCell>
                  </TableRow>
                ))}
                {data.agentPerformance.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-sm text-muted-foreground">
                      No agent performance data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly & Monthly Summary</CardTitle>
            <p className="text-sm text-muted-foreground">
              Snapshot of performance over the current period.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs uppercase text-muted-foreground">This week</div>
              <div className="mt-2 text-2xl font-semibold">{data.summaries.week.created}</div>
              <div className="text-sm text-muted-foreground">Tickets created</div>
              <div className="mt-3 text-sm">
                Resolved: <span className="font-medium">{data.summaries.week.resolved}</span>
              </div>
              <div className="text-sm">
                Avg resolution:{" "}
                <span className="font-medium">{data.summaries.week.avgResolutionHours}h</span>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="text-xs uppercase text-muted-foreground">This month</div>
              <div className="mt-2 text-2xl font-semibold">{data.summaries.month.created}</div>
              <div className="text-sm text-muted-foreground">Tickets created</div>
              <div className="mt-3 text-sm">
                Resolved: <span className="font-medium">{data.summaries.month.resolved}</span>
              </div>
              <div className="text-sm">
                Avg resolution:{" "}
                <span className="font-medium">{data.summaries.month.avgResolutionHours}h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

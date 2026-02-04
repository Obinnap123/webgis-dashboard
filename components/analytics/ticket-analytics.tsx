"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
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
import { TicketAnalytics } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CATEGORY_COLORS: Record<string, string> = {
  LOW: "#60a5fa",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
  URGENT: "#7c3aed",
  UNKNOWN: "#94a3b8",
};

function formatShortDate(label: any) {
  if (!label) return "";
  const date = label instanceof Date ? label : new Date(String(label));
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatMonth(label: any) {
  if (!label) return "";
  const date = label instanceof Date ? label : new Date(String(label));
  return date.toLocaleDateString(undefined, { month: "short" });
}

export function TicketAnalyticsPanel({ rangeDays = 90 }: { rangeDays?: number }) {
  const router = useRouter();
  const [data, setData] = useState<TicketAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"daily" | "weekly" | "monthly">("daily");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/analytics/tickets?rangeDays=${rangeDays}`);
        const payload = await response.json();
        if (payload.success) {
          setData(payload.data);
        }
      } catch (error) {
        console.error("Failed to load ticket analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [rangeDays]);

  const rangeData = useMemo(() => {
    if (!data) return [];
    if (range === "weekly") return data.weekly;
    if (range === "monthly") return data.monthly;
    return data.daily;
  }, [data, range]);

  const insights = useMemo(() => {
    if (!data || data.daily.length < 14) return null;
    const last7 = data.daily.slice(-7).reduce((acc, item) => acc + item.count, 0);
    const prev7 = data.daily.slice(-14, -7).reduce((acc, item) => acc + item.count, 0);
    const diff = prev7 === 0 ? 0 : Math.round(((last7 - prev7) / prev7) * 100);
    return { last7, prev7, diff };
  }, [data]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading ticket analytics...</div>;
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        No ticket analytics available yet. Create or assign tickets to see trends.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Tickets Created</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track ticket creation by day, week, or month.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={range === "daily" ? "default" : "outline"}
                size="sm"
                onClick={() => setRange("daily")}
              >
                Daily
              </Button>
              <Button
                type="button"
                variant={range === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => setRange("weekly")}
              >
                Weekly
              </Button>
              <Button
                type="button"
                variant={range === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setRange("monthly")}
              >
                Monthly
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-56 sm:h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rangeData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={range === "daily" ? "date" : "period"}
                  tickFormatter={range === "monthly" ? formatMonth : formatShortDate}
                />
                <YAxis allowDecimals={false} />
                <Tooltip
                  labelFormatter={range === "monthly" ? formatMonth : formatShortDate}
                />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Ticket Periods</CardTitle>
            <p className="text-sm text-muted-foreground">
              Click a peak to view tickets from that day.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.peakPeriods.length === 0 && (
              <div className="text-sm text-muted-foreground">No peaks yet.</div>
            )}
            {data.peakPeriods.map((peak) => (
              <button
                key={peak.date}
                type="button"
                onClick={() =>
                  router.push(
                    `/tickets?createdFrom=${peak.date}&createdTo=${peak.date}`,
                  )
                }
                className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left hover:bg-accent"
              >
                <div className="text-sm font-medium">{formatShortDate(peak.date)}</div>
                <Badge variant="secondary">{peak.count} tickets</Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-semibold">{insights.last7}</div>
              <p className="text-sm text-muted-foreground">
                {insights.diff >= 0 ? "+" : ""}
                {insights.diff}% vs previous 7 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Previous 7 Days</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-3xl font-semibold">{insights.prev7}</div>
              <p className="text-sm text-muted-foreground">
                Baseline for comparison
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Categories Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Click a category to view matching tickets.
            </p>
          </CardHeader>
          <CardContent className="h-56 sm:h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  dataKey="count"
                  nameKey="category"
                  innerRadius={50}
                  outerRadius={90}
                  label
                  onClick={(entry) =>
                    router.push(`/tickets?priority=${encodeURIComponent(entry?.category)}`)
                  }
                >
                  {data.categoryDistribution.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[entry.category] || "#94a3b8"}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={24} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-56 sm:h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.resolutionTrends} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tickFormatter={formatShortDate} />
                <YAxis />
                <Tooltip labelFormatter={formatShortDate} />
                <Bar dataKey="avgHours" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

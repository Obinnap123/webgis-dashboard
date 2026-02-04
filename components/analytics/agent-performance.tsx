"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { AgentAnalytics } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TREND_COLORS = ["#2563eb", "#22c55e", "#f97316", "#a855f7"];

function formatWeek(label: any) {
  if (!label) return "";
  const date = label instanceof Date ? label : new Date(String(label));
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function AgentPerformanceAnalytics({ rangeDays = 90 }: { rangeDays?: number }) {
  const [data, setData] = useState<AgentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/analytics/agents?rangeDays=${rangeDays}`);
        const payload = await response.json();
        if (payload.success) {
          setData(payload.data);
        }
      } catch (error) {
        console.error("Failed to load agent analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [rangeDays]);

  const chartAgents = useMemo(() => data?.agents ?? [], [data]);
  const topAgents = useMemo(() => data?.topAgents ?? [], [data]);
  const trends = useMemo(() => data?.productivityTrends ?? [], [data]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading agent analytics...</div>;
  }

  if (!data) {
    return <div className="text-sm text-muted-foreground">No agent analytics available.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tickets Handled Per Agent</CardTitle>
          </CardHeader>
          <CardContent className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartAgents} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="agentName" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="handled" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution Time Per Agent (Hours)</CardTitle>
          </CardHeader>
          <CardContent className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartAgents} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="agentName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgResolutionHours" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Open vs Resolved Tickets</CardTitle>
          </CardHeader>
          <CardContent className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartAgents} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="agentName" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="open" stackId="a" fill="#f97316" radius={[6, 6, 0, 0]} />
                <Bar dataKey="resolved" stackId="a" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent Productivity Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tickFormatter={formatWeek} />
                <YAxis allowDecimals={false} />
                <Tooltip labelFormatter={formatWeek} />
                {topAgents.map((agent, index) => (
                  <Line
                    key={agent.agentId}
                    type="monotone"
                    dataKey={agent.agentId}
                    name={agent.agentName}
                    stroke={TREND_COLORS[index % TREND_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Handled</TableHead>
                <TableHead>Resolved</TableHead>
                <TableHead>Open</TableHead>
                <TableHead>Avg Resolution (hrs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.agents.map((agent) => (
                <TableRow key={agent.agentId}>
                  <TableCell className="font-medium">{agent.agentName}</TableCell>
                  <TableCell>{agent.handled}</TableCell>
                  <TableCell>{agent.resolved}</TableCell>
                  <TableCell>{agent.open}</TableCell>
                  <TableCell>{agent.avgResolutionHours}</TableCell>
                </TableRow>
              ))}
              {data.agents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground">
                    No agent data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

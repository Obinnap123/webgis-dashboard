import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function weekKey(date: Date) {
  return dateKey(startOfWeek(date));
}

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const isAdmin = (user as any).role === "ADMIN";
    const userScope = isAdmin
      ? {}
      : {
          assignedToId: (user as any).id,
        };

    const { searchParams } = new URL(req.url);
    const rangeDays = Math.max(30, Math.min(180, Number(searchParams.get("rangeDays") || 90)));

    const now = new Date();
    const trendStart = new Date(now);
    trendStart.setDate(trendStart.getDate() - (rangeDays - 1));
    trendStart.setHours(0, 0, 0, 0);

    const [allAssignedTickets, resolvedForTrend] = await Promise.all([
      prisma.ticket.findMany({
        where: {
          assignedToId: { not: null },
          ...userScope,
        },
        select: {
          status: true,
          createdAt: true,
          resolvedAt: true,
          assignedTo: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.ticket.findMany({
        where: {
          assignedToId: { not: null },
          resolvedAt: { gte: trendStart, not: null },
          ...userScope,
        },
        select: {
          resolvedAt: true,
          assignedTo: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    const agentMap = new Map<
      string,
      {
        agentId: string;
        agentName: string;
        handled: number;
        resolved: number;
        open: number;
        totalHours: number;
      }
    >();

    for (const ticket of allAssignedTickets) {
      if (!ticket.assignedTo) continue;
      const agentName = ticket.assignedTo.name || ticket.assignedTo.email;
      const existing = agentMap.get(ticket.assignedTo.id) || {
        agentId: ticket.assignedTo.id,
        agentName,
        handled: 0,
        resolved: 0,
        open: 0,
        totalHours: 0,
      };
      existing.handled += 1;
      if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
        existing.resolved += 1;
        if (ticket.resolvedAt) {
          existing.totalHours +=
            (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) /
            (1000 * 60 * 60);
        }
      } else {
        existing.open += 1;
      }
      agentMap.set(ticket.assignedTo.id, existing);
    }

    const agents = Array.from(agentMap.values())
      .map((agent) => ({
        agentId: agent.agentId,
        agentName: agent.agentName,
        handled: agent.handled,
        resolved: agent.resolved,
        open: agent.open,
        avgResolutionHours:
          agent.resolved > 0 ? Math.round(agent.totalHours / agent.resolved) : 0,
      }))
      .sort((a, b) => b.resolved - a.resolved);

    const topAgents = agents.slice(0, isAdmin ? 4 : 1).map((agent) => ({
      agentId: agent.agentId,
      agentName: agent.agentName,
    }));

    const weekBuckets = Array.from({ length: Math.max(4, Math.ceil(rangeDays / 7)) }).map((_, index) => {
      const d = new Date(trendStart);
      d.setDate(trendStart.getDate() + index * 7);
      return weekKey(d);
    });

    const trendMap = new Map<string, Record<string, number>>();
    for (const week of weekBuckets) {
      trendMap.set(
        week,
        topAgents.reduce<Record<string, number>>((acc, agent) => {
          acc[agent.agentId] = 0;
          return acc;
        }, {}),
      );
    }

    for (const ticket of resolvedForTrend) {
      if (!ticket.assignedTo || !ticket.resolvedAt) continue;
      const isTopAgent = topAgents.find((agent) => agent.agentId === ticket.assignedTo.id);
      if (!isTopAgent) continue;
      const key = weekKey(ticket.resolvedAt);
      const weekEntry = trendMap.get(key);
      if (!weekEntry) continue;
      weekEntry[ticket.assignedTo.id] = (weekEntry[ticket.assignedTo.id] || 0) + 1;
    }

    const productivityTrends = weekBuckets.map((week) => ({
      period: week,
      ...(trendMap.get(week) || {}),
    }));

    return NextResponse.json({
      success: true,
      data: {
        agents,
        topAgents,
        productivityTrends,
      },
    });
  } catch (error) {
    console.error("Error fetching agent analytics:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

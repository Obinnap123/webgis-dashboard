import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";

type CountGroup = { status?: string; priority?: string; _count: { _all: number } };

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

export async function GET() {
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
          OR: [
            { createdById: (user as any).id },
            { assignedToId: (user as any).id },
          ],
        };

    const now = new Date();
    const volumeStart = new Date(now);
    volumeStart.setDate(volumeStart.getDate() - 29);
    volumeStart.setHours(0, 0, 0, 0);

    const trendStart = new Date(now);
    trendStart.setDate(trendStart.getDate() - 83);
    trendStart.setHours(0, 0, 0, 0);

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      statusGroups,
      priorityGroups,
      recentCreated,
      resolvedForTrends,
      assignedTickets,
      recentActivities,
    ] = await Promise.all([
      prisma.ticket.count({ where: userScope }),
      prisma.ticket.count({ where: { ...userScope, status: "OPEN" } }),
      prisma.ticket.count({ where: { ...userScope, status: "IN_PROGRESS" } }),
      prisma.ticket.count({ where: { ...userScope, status: "RESOLVED" } }),
      prisma.ticket.groupBy({ by: ["status"], _count: { _all: true }, where: userScope }),
      prisma.ticket.groupBy({ by: ["priority"], _count: { _all: true }, where: userScope }),
      prisma.ticket.findMany({
        where: { ...userScope, createdAt: { gte: volumeStart } },
        select: { createdAt: true },
      }),
      prisma.ticket.findMany({
        where: { ...userScope, resolvedAt: { gte: trendStart, not: null } },
        select: { createdAt: true, resolvedAt: true },
      }),
      prisma.ticket.findMany({
        where: {
          ...userScope,
          assignedToId: { not: null },
          createdAt: { gte: trendStart },
        },
        select: {
          status: true,
          createdAt: true,
          resolvedAt: true,
          assignedTo: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.activity.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        where: isAdmin
          ? undefined
          : {
              ticket: {
                OR: [
                  { createdById: (user as any).id },
                  { assignedToId: (user as any).id },
                ],
              },
            },
        include: {
          user: { select: { id: true, name: true, email: true } },
          ticket: { select: { id: true, title: true, status: true, priority: true } },
        },
      }),
    ]);

    const ticketVolumeMap = new Map<string, number>();
    for (const ticket of recentCreated) {
      const key = dateKey(ticket.createdAt);
      ticketVolumeMap.set(key, (ticketVolumeMap.get(key) || 0) + 1);
    }

    const ticketVolume = Array.from({ length: 30 }).map((_, index) => {
      const d = new Date(volumeStart);
      d.setDate(volumeStart.getDate() + index);
      const key = dateKey(d);
      return { date: key, count: ticketVolumeMap.get(key) || 0 };
    });

    const resolutionTrendMap = new Map<string, { total: number; count: number }>();
    for (const ticket of resolvedForTrends) {
      if (!ticket.resolvedAt) continue;
      const hours =
        (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) /
        (1000 * 60 * 60);
      const key = weekKey(ticket.resolvedAt);
      const existing = resolutionTrendMap.get(key) || { total: 0, count: 0 };
      resolutionTrendMap.set(key, {
        total: existing.total + hours,
        count: existing.count + 1,
      });
    }

    const resolutionTrends = Array.from({ length: 12 }).map((_, index) => {
      const d = new Date(trendStart);
      d.setDate(trendStart.getDate() + index * 7);
      const key = weekKey(d);
      const entry = resolutionTrendMap.get(key);
      return {
        period: key,
        avgHours: entry ? Math.round(entry.total / entry.count) : 0,
      };
    });

    const agentMap = new Map<
      string,
      { id: string; name: string; assigned: number; resolved: number; open: number; totalHours: number }
    >();

    for (const ticket of assignedTickets) {
      if (!ticket.assignedTo) continue;
      const name = ticket.assignedTo.name || ticket.assignedTo.email || "Unassigned";
      const existing = agentMap.get(ticket.assignedTo.id) || {
        id: ticket.assignedTo.id,
        name,
        assigned: 0,
        resolved: 0,
        open: 0,
        totalHours: 0,
      };
      existing.assigned += 1;
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

    const agentPerformance = Array.from(agentMap.values())
      .map((agent) => ({
        agentId: agent.id,
        agentName: agent.name,
        assigned: agent.assigned,
        resolved: agent.resolved,
        open: agent.open,
        avgResolutionHours:
          agent.resolved > 0 ? Math.round(agent.totalHours / agent.resolved) : 0,
      }))
      .sort((a, b) => b.resolved - a.resolved)
      .slice(0, isAdmin ? 6 : 3);

    const statusCounts = (statusGroups as CountGroup[]).map((group) => ({
      status: group.status || "UNKNOWN",
      count: group._count._all,
    }));

    const priorityCounts = (priorityGroups as CountGroup[]).map((group) => ({
      priority: group.priority || "UNKNOWN",
      count: group._count._all,
    }));

    const avgResolutionHours = resolvedForTrends.length
      ? Math.round(
          resolvedForTrends.reduce(
            (acc: number, ticket: { createdAt: Date; resolvedAt: Date | null }) => {
            if (!ticket.resolvedAt) return acc;
            const hours =
              (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) /
              (1000 * 60 * 60);
            return acc + hours;
            },
            0,
          ) / resolvedForTrends.length,
        )
      : 0;

    const data = {
      kpis: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        avgResolutionHours,
      },
      ticketVolume,
      resolutionTrends,
      ticketsByStatus: statusCounts,
      ticketsByPriority: priorityCounts,
      agentPerformance,
      recentActivities,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

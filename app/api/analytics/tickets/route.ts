import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";

type CountGroup = { priority?: string; _count: { _all: number } };

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function weekKey(date: Date) {
  return dateKey(startOfWeek(date));
}

function monthKey(date: Date) {
  const d = startOfMonth(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
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
          OR: [
            { createdById: (user as any).id },
            { assignedToId: (user as any).id },
          ],
        };

    const { searchParams } = new URL(req.url);
    const rangeDays = Math.max(30, Math.min(180, Number(searchParams.get("rangeDays") || 90)));

    const now = new Date();
    const dailyStart = new Date(now);
    dailyStart.setDate(dailyStart.getDate() - (rangeDays - 1));
    dailyStart.setHours(0, 0, 0, 0);

    const weeklyStart = new Date(now);
    weeklyStart.setDate(weeklyStart.getDate() - (rangeDays - 1));
    weeklyStart.setHours(0, 0, 0, 0);

    const monthCount = Math.max(3, Math.ceil(rangeDays / 30));
    const monthStart = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1), 1);

    const [dailyTickets, monthlyTickets, priorityGroups, resolvedForTrends] =
      await Promise.all([
        prisma.ticket.findMany({
          where: { ...userScope, createdAt: { gte: dailyStart } },
          select: { createdAt: true },
        }),
        prisma.ticket.findMany({
          where: { ...userScope, createdAt: { gte: monthStart } },
          select: { createdAt: true },
        }),
        prisma.ticket.groupBy({
          by: ["priority"],
          _count: { _all: true },
          where: userScope,
        }),
        prisma.ticket.findMany({
          where: { ...userScope, resolvedAt: { gte: weeklyStart, not: null } },
          select: { createdAt: true, resolvedAt: true },
        }),
      ]);

    const dailyMap = new Map<string, number>();
    for (const ticket of dailyTickets) {
      const key = dateKey(ticket.createdAt);
      dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
    }

    const daily = Array.from({ length: rangeDays }).map((_, index) => {
      const d = new Date(dailyStart);
      d.setDate(dailyStart.getDate() + index);
      const key = dateKey(d);
      return { date: key, count: dailyMap.get(key) || 0 };
    });

    const weeklyMap = new Map<string, number>();
    for (const ticket of dailyTickets) {
      const key = weekKey(ticket.createdAt);
      weeklyMap.set(key, (weeklyMap.get(key) || 0) + 1);
    }

    const weekly = Array.from({ length: Math.max(4, Math.ceil(rangeDays / 7)) }).map((_, index) => {
      const d = new Date(weeklyStart);
      d.setDate(weeklyStart.getDate() + index * 7);
      const key = weekKey(d);
      return { period: key, count: weeklyMap.get(key) || 0 };
    });

    const monthlyMap = new Map<string, number>();
    for (const ticket of monthlyTickets) {
      const key = monthKey(ticket.createdAt);
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
    }

    const monthly = Array.from({ length: monthCount }).map((_, index) => {
      const d = new Date(monthStart.getFullYear(), monthStart.getMonth() + index, 1);
      const key = monthKey(d);
      return { period: key, count: monthlyMap.get(key) || 0 };
    });

    const peakPeriods = [...daily]
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .filter((entry) => entry.count > 0);

    const categoryDistribution = (priorityGroups as CountGroup[]).map((group) => ({
      category: group.priority || "UNKNOWN",
      count: group._count._all,
    }));

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

    const resolutionTrends = Array.from({ length: Math.max(4, Math.ceil(rangeDays / 7)) }).map((_, index) => {
      const d = new Date(weeklyStart);
      d.setDate(weeklyStart.getDate() + index * 7);
      const key = weekKey(d);
      const entry = resolutionTrendMap.get(key);
      return {
        period: key,
        avgHours: entry ? Math.round(entry.total / entry.count) : 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        daily,
        weekly,
        monthly,
        peakPeriods,
        categoryDistribution,
        resolutionTrends,
      },
    });
  } catch (error) {
    console.error("Error fetching ticket analytics:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

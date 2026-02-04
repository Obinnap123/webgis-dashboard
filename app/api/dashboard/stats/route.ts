import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { DashboardStats } from "@/types";

export async function GET(req: NextRequest) {
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

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      lowPriority,
      mediumPriority,
      highPriority,
      urgentPriority,
      recentTickets,
    ] = await Promise.all([
      prisma.ticket.count({ where: userScope }),
      prisma.ticket.count({ where: { ...userScope, status: "OPEN" } }),
      prisma.ticket.count({ where: { ...userScope, status: "IN_PROGRESS" } }),
      prisma.ticket.count({ where: { ...userScope, status: "RESOLVED" } }),
      prisma.ticket.count({ where: { ...userScope, priority: "LOW" } }),
      prisma.ticket.count({ where: { ...userScope, priority: "MEDIUM" } }),
      prisma.ticket.count({ where: { ...userScope, priority: "HIGH" } }),
      prisma.ticket.count({ where: { ...userScope, priority: "URGENT" } }),
      prisma.ticket.findMany({
        where: userScope,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    // Calculate average resolution time (in hours)
    const resolvedTicketsWithTime = await prisma.ticket.findMany({
      where: { ...userScope, status: "RESOLVED", resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
    });

    let avgResolutionTime = 0;
    if (resolvedTicketsWithTime.length > 0) {
      const totalTime = resolvedTicketsWithTime.reduce(
        (acc: number, ticket: any) => {
          const time =
            (ticket.resolvedAt!.getTime() - ticket.createdAt.getTime()) /
            (1000 * 60 * 60); // convert to hours
          return acc + time;
        },
        0,
      );
      avgResolutionTime = Math.round(
        totalTime / resolvedTicketsWithTime.length,
      );
    }

    const stats: DashboardStats = {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      avgResolutionTime,
      ticketsByPriority: {
        LOW: lowPriority,
        MEDIUM: mediumPriority,
        HIGH: highPriority,
        URGENT: urgentPriority,
      },
      recentTickets: recentTickets as any,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

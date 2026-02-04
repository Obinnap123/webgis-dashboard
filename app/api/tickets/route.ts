import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { CreateTicketInput, ApiResponse, TicketWithUser } from "@/types";

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
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const createdFrom = searchParams.get("createdFrom");
    const createdTo = searchParams.get("createdTo");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (isAdmin && assignedTo) where.assignedToId = assignedTo;

    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) where.createdAt.gte = new Date(createdFrom);
      if (createdTo) {
        const end = new Date(createdTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (!isAdmin) {
      where.OR = [
        { createdById: (user as any).id },
        { assignedToId: (user as any).id },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.ticket.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { tickets, total, limit, offset },
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const isAdmin = (user as any).role === "ADMIN";
    const body: CreateTicketInput = await req.json();

    if (!body.title || !body.description) {
      return NextResponse.json(
        { success: false, error: "Title and description are required" },
        { status: 400 },
      );
    }

    let assignedToId: string | null | undefined = undefined;
    if (body.assignedToId !== undefined && body.assignedToId !== null) {
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: "Only admins can assign tickets" },
          { status: 403 },
        );
      }
      const assignee = await prisma.user.findUnique({
        where: { id: body.assignedToId },
        select: { id: true, isActive: true },
      });
      if (!assignee || !assignee.isActive) {
        return NextResponse.json(
          { success: false, error: "Assigned user not found or inactive" },
          { status: 400 },
        );
      }
      assignedToId = body.assignedToId;
    }

    const ticket = await prisma.ticket.create({
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority || "MEDIUM",
        createdById: (user as any).id,
        assignedToId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        ticketId: ticket.id,
        userId: (user as any).id,
        action: "created",
        newValue: ticket.status,
      },
    });

    if (assignedToId) {
      await prisma.activity.create({
        data: {
          ticketId: ticket.id,
          userId: (user as any).id,
          action: "assigned",
          newValue: assignedToId,
        },
      });
    }

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

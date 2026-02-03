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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = assignedTo;

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

    const body: CreateTicketInput = await req.json();

    if (!body.title || !body.description) {
      return NextResponse.json(
        { success: false, error: "Title and description are required" },
        { status: 400 },
      );
    }

    const ticket = await prisma.ticket.create({
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority || "MEDIUM",
        createdById: (user as any).id,
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

    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

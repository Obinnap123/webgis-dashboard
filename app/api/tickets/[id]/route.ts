import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { UpdateTicketInput, ApiResponse } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const isAdmin = (user as any).role === "ADMIN";
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        activities: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 },
      );
    }

    if (
      !isAdmin &&
      ticket.createdById !== (user as any).id &&
      ticket.assignedToId !== (user as any).id
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const isAdmin = (user as any).role === "ADMIN";
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 },
      );
    }

    if (
      !isAdmin &&
      ticket.createdById !== (user as any).id &&
      ticket.assignedToId !== (user as any).id
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const body: UpdateTicketInput = await req.json();
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.assignedToId !== undefined) {
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: "Only admins can assign tickets" },
          { status: 403 },
        );
      }
      updateData.assignedToId = body.assignedToId;
    }

    if (body.status !== undefined) {
      updateData.status = body.status;
      if (
        body.status === "RESOLVED" ||
        body.status === "CLOSED" ||
        body.status === "RESOLVED"
      ) {
        updateData.resolvedAt = new Date();
      }

      // Log status change
      await prisma.activity.create({
        data: {
          ticketId: ticket.id,
          userId: (user as any).id,
          action: "status_changed",
          previousValue: ticket.status,
          newValue: body.status,
        },
      });
    }

    if (body.assignedToId !== undefined && ticket.assignedToId !== body.assignedToId) {
      await prisma.activity.create({
        data: {
          ticketId: ticket.id,
          userId: (user as any).id,
          action: "assigned",
          previousValue: ticket.assignedToId,
          newValue: body.assignedToId,
        },
      });
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only admin can delete tickets
    if ((user as any).role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only admins can delete tickets" },
        { status: 403 },
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 },
      );
    }

    await prisma.ticket.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Ticket deleted successfully" },
    });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

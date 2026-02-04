import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { CreateUserInput, ApiResponse } from "@/types";
import bcrypt from "bcrypt";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || (user as any).role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const [users, ticketGroups] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.ticket.groupBy({
        by: ["assignedToId", "status"],
        _count: { _all: true },
        where: { assignedToId: { not: null } },
      }),
    ]);

    const countsMap = new Map<
      string,
      { total: number; OPEN: number; IN_PROGRESS: number; RESOLVED: number; CLOSED: number }
    >();

    for (const group of ticketGroups) {
      if (!group.assignedToId) continue;
      const entry = countsMap.get(group.assignedToId) || {
        total: 0,
        OPEN: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0,
        CLOSED: 0,
      };
      const count = group._count._all;
      entry.total += count;
      entry[group.status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"] = count;
      countsMap.set(group.assignedToId, entry);
    }

    const usersWithCounts = users.map(
      (user: {
        id: string;
        email: string;
        name: string | null;
        role: string;
        isActive: boolean;
        createdAt: Date;
      }) => ({
      ...user,
      ticketCounts:
        countsMap.get(user.id) || {
          total: 0,
          OPEN: 0,
          IN_PROGRESS: 0,
          RESOLVED: 0,
          CLOSED: 0,
        },
      }),
    );

    return NextResponse.json({ success: true, data: usersWithCounts });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || (user as any).role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const body: CreateUserInput = await req.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name || null,
        password: hashedPassword,
        role: body.role || "STAFF",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

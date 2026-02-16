import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { CreateUserInput } from "@/types";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[0-9]/, "Password must include a number"),
  role: z.enum(["ADMIN", "STAFF"]).optional(),
});

export async function GET() {
  try {
    const user = await getAuthUser();
    const authUserRole = (user as { role?: string } | null)?.role;
    if (!user || authUserRole !== "ADMIN") {
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
          emailVerifiedAt: true, // Include for display if needed
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
        emailVerifiedAt: Date | null;
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
    const authUserRole = (user as { role?: string } | null)?.role;
    if (!user || authUserRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const rawBody: CreateUserInput = await req.json();
    const parsed = createUserSchema.safeParse(rawBody);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const normalizedEmail = input.email.toLowerCase();
    const normalizedName = input.name?.trim() || null;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: normalizedName,
        password: hashedPassword,
        role: input.role || "STAFF",
        isActive: false, // Explicitly set to false as per requirement
        emailVerificationToken: emailVerificationToken,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        emailVerifiedAt: true,
      },
    });

    const emailResult = await sendVerificationEmail({
      to: newUser.email,
      token: emailVerificationToken,
      userName: newUser.name,
    });

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        meta: { verificationEmailSent: emailResult.sent },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

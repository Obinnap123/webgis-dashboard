import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function redirectToLogin(req: NextRequest, verification: string) {
  const url = new URL("/login", req.nextUrl.origin);
  url.searchParams.set("verification", verification);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return redirectToLogin(req, "invalid");
    }

    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
      select: {
        id: true,
        emailVerifiedAt: true,
        isActive: true,
      },
    });

    if (!user) {
      return redirectToLogin(req, "invalid");
    }

    if (user.emailVerifiedAt && user.isActive) {
      return redirectToLogin(req, "already");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        isActive: true,
        emailVerificationToken: null,
      },
    });

    return redirectToLogin(req, "success");
  } catch (error) {
    console.error("Error verifying email:", error);
    return redirectToLogin(req, "error");
  }
}

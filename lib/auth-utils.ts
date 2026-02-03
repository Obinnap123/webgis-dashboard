import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

export async function requireAuth(requiredRole?: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (requiredRole && (session.user as any).role !== requiredRole) {
    redirect("/unauthorized");
  }

  return session;
}

export async function getAuthUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

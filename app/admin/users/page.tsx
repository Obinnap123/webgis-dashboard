import { requireAuth } from "@/lib/auth-utils";
import { UsersPageContent } from "./page-content";

export default async function UsersPage() {
  await requireAuth();

  return <UsersPageContent />;
}

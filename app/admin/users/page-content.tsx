"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
  createdAt: string;
}

export function UsersPageContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user && (session.user as any).role !== "ADMIN") {
      router.push("/dashboard");
    } else {
      fetchUsers();
    }
  }, [session, router]);

  async function fetchUsers() {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.error || "Failed to load users");
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleChangeRole(userId: string, newRole: "ADMIN" | "STAFF") {
    setUpdatingUserId(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (data.success) {
        setUsers(users.map((u) => (u.id === userId ? data.data : u)));
      } else {
        setError(data.error || "Failed to update user role");
      }
    } catch (err) {
      console.error("Failed to update user role:", err);
      setError("Failed to update user role");
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        setError(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError("Failed to delete user");
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-2">
              Manage team members and their roles
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push("/admin/users/new")}
          >
            <Plus size={20} className="mr-2" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Joined
                      </th>
                      <th className="text-left py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {user.email}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {user.name || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                user.role === "ADMIN"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }
                            >
                              {user.role}
                            </Badge>
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleChangeRole(
                                  user.id,
                                  e.target.value as "ADMIN" | "STAFF"
                                )
                              }
                              disabled={updatingUserId === user.id}
                              className="text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:border-gray-400 disabled:opacity-50 cursor-pointer"
                            >
                              <option value="">Change role...</option>
                              <option value="ADMIN">Make Admin</option>
                              <option value="STAFF">Make Staff</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              user.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

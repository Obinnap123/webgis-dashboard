"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
  createdAt: string;
  ticketCounts: {
    total: number;
    OPEN: number;
    IN_PROGRESS: number;
    RESOLVED: number;
    CLOSED: number;
  };
}

export function UsersPageContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  function resetCreateForm() {
    setCreateEmail("");
    setCreateName("");
    setCreatePassword("");
    setCreateRole("STAFF");
    setCreateError("");
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setIsCreating(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createEmail,
          name: createName || null,
          password: createPassword,
          role: createRole,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setCreateError(data.error || "Failed to create user");
        return;
      }

      setIsCreateOpen(false);
      resetCreateForm();
      fetchUsers();
    } catch (err) {
      console.error("Failed to create user:", err);
      setCreateError("Failed to create user");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500 mt-1 md:text-gray-600 md:mt-2">
              Manage team members
            </p>
          </div>
          <Dialog
            open={isCreateOpen}
            onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) {
                resetCreateForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="default" className="shrink-0">
                <Plus size={20} className="mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a team member account with a role and login credentials.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
                {createError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {createError}
                  </div>
                )}

                <Input
                  label="Email"
                  type="email"
                  placeholder="user@example.com"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  required
                />

                <Input
                  label="Name"
                  type="text"
                  placeholder="Jane Doe"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="********"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  required
                />

                <Select
                  label="Role"
                  value={createRole}
                  onChange={(value) => setCreateRole(value as "ADMIN" | "STAFF")}
                  options={[
                    { value: "STAFF", label: "Staff" },
                    { value: "ADMIN", label: "Admin" },
                  ]}
                />

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    isLoading={isCreating}
                    disabled={!createEmail || !createPassword}
                  >
                    Create User
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                        Tickets
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
                          <div className="flex items-center gap-3">
                            <Badge
                              className={
                                user.role === "ADMIN"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }
                            >
                              {user.role}
                            </Badge>
                            <Select
                              value={user.role}
                              onChange={(value) =>
                                handleChangeRole(
                                  user.id,
                                  value as "ADMIN" | "STAFF",
                                )
                              }
                              disabled={updatingUserId === user.id}
                              options={[
                                { value: "ADMIN", label: "👑 Admin" },
                                { value: "STAFF", label: "👤 Staff" },
                              ]}
                              className="w-32"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <div className="font-medium text-gray-900">
                            {user.ticketCounts.total} total
                          </div>
                          <div className="text-xs text-gray-500">
                            O: {user.ticketCounts.OPEN} · P: {user.ticketCounts.IN_PROGRESS} · R:{" "}
                            {user.ticketCounts.RESOLVED} · C: {user.ticketCounts.CLOSED}
                          </div>
                          <Link
                            href={`/tickets?assignedTo=${user.id}`}
                            className={buttonVariants({ variant: "link", size: "sm" })}
                          >
                            View tickets
                          </Link>
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

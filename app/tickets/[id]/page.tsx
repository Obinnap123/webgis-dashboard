"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UpdateTicketInput, TicketWithUser } from "@/types";
import { ArrowLeft, Trash2 } from "lucide-react";

const priorityColors: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

const statusColors: Record<string, string> = {
  OPEN: "bg-red-100 text-red-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

interface Ticket extends TicketWithUser {
  activities: any[];
}

interface UserOption {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<string>("OPEN");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [assignedToId, setAssignedToId] = useState<string>("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [usersError, setUsersError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTicket();
    if (isAdmin) {
      fetchUsers();
    }
  }, [id, isAdmin]);

  async function fetchTicket() {
    try {
      const response = await fetch(`/api/tickets/${id}`);
      const data = await response.json();

      if (data.success) {
        setTicket(data.data);
        setStatus(data.data.status);
        setPriority(data.data.priority);
        setAssignedToId(data.data.assignedTo?.id || "");
      }
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
      setError("Failed to load ticket");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.filter((user: UserOption) => user.isActive));
      } else {
        if (response.status === 403) {
          setUsersError("Only admins can assign tickets.");
        } else {
          setUsersError(data.error || "Unable to load users");
        }
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsersError("Unable to load users");
    }
  }

  async function handleUpdate() {
    setError("");
    setIsUpdating(true);

    try {
      const updateData: UpdateTicketInput = {
        status,
        priority,
      };
      if (isAdmin) {
        updateData.assignedToId = assignedToId || null;
      }

      const response = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to update ticket");
        return;
      }

      setTicket(data.data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to delete ticket");
        return;
      }

      router.push("/tickets");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-red-600">Ticket not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button
          onClick={() => router.push("/tickets")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={20} />
          Back to Tickets
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{ticket.title}</CardTitle>
                    <p className="text-gray-600 mt-2">{ticket.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Created By</p>
                    <p className="font-medium">{ticket.createdBy.name || ticket.createdBy.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assigned To</p>
                    <p className="font-medium">
                      {ticket.assignedTo ? (
                        ticket.assignedTo.name || ticket.assignedTo.email
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Updated</p>
                    <p className="font-medium">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {ticket.activities && ticket.activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ticket.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start justify-between border-b pb-3 last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {activity.action}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.user.name || activity.user.email}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Update Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Status
                  </p>
                  <Badge className={statusColors[status]}>
                    {status}
                  </Badge>
                  <Select
                    value={status}
                    onChange={(value) => setStatus(value)}
                    options={[
                      { value: "OPEN", label: "Open" },
                      { value: "IN_PROGRESS", label: "In Progress" },
                      { value: "RESOLVED", label: "Resolved" },
                      { value: "CLOSED", label: "Closed" },
                    ]}
                    className="mt-2"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </p>
                  <Badge className={priorityColors[priority]}>
                    {priority}
                  </Badge>
                  <Select
                    value={priority}
                    onChange={(value) =>
                      setPriority(value)
                    }
                    options={[
                      { value: "LOW", label: "Low" },
                      { value: "MEDIUM", label: "Medium" },
                      { value: "HIGH", label: "High" },
                      { value: "URGENT", label: "Urgent" },
                    ]}
                    className="mt-2"
                  />
                </div>

                {isAdmin && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Assigned To
                    </p>
                    {usersError ? (
                      <p className="text-sm text-red-600">{usersError}</p>
                    ) : (
                      <Select
                        value={assignedToId}
                        onChange={(value) => setAssignedToId(value)}
                        options={[
                          { value: "", label: "Unassigned" },
                          ...users.map((user) => ({
                            value: user.id,
                            label: user.name || user.email,
                          })),
                        ]}
                        className="mt-2"
                      />
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    isLoading={isUpdating}
                    onClick={handleUpdate}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isUpdating}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

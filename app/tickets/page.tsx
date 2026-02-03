"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TicketWithUser } from "@/types";
import { Plus, ChevronRight } from "lucide-react";

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

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");

  useEffect(() => {
    fetchTickets();
  }, [status, priority]);

  async function fetchTickets() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (priority) params.append("priority", priority);

      const response = await fetch(`/api/tickets?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTickets(data.data.tickets);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
            <p className="text-gray-600 mt-2">
              Manage service requests and tickets
            </p>
          </div>
          <Link href="/tickets/new">
            <Button variant="primary">
              <Plus size={20} className="mr-2" />
              New Ticket
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: "", label: "All Status" },
                  { value: "OPEN", label: "Open" },
                  { value: "IN_PROGRESS", label: "In Progress" },
                  { value: "RESOLVED", label: "Resolved" },
                  { value: "CLOSED", label: "Closed" },
                ]}
              />
              <Select
                label="Priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                options={[
                  { value: "", label: "All Priority" },
                  { value: "LOW", label: "Low" },
                  { value: "MEDIUM", label: "Medium" },
                  { value: "HIGH", label: "High" },
                  { value: "URGENT", label: "Urgent" },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Tickets ({tickets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No tickets found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Priority
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Created By
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Assigned To
                      </th>
                      <th className="text-left py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {ticket.title}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[ticket.status]}>
                            {ticket.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={priorityColors[ticket.priority]}>
                            {ticket.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {ticket.createdBy.name || ticket.createdBy.email}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {ticket.assignedTo
                            ? ticket.assignedTo.name || ticket.assignedTo.email
                            : "Unassigned"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/tickets/${ticket.id}`}>
                            <ChevronRight size={20} className="text-gray-400" />
                          </Link>
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

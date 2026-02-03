"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TicketWithUser } from "@/types";
import { ChevronRight, Loader2 } from "lucide-react";
import { NewTicketDialog } from "@/components/tickets/new-ticket-dialog";

// Helper for Badge variants based on status
const getStatusVariant = (status: string) => {
  switch (status) {
    case "OPEN": return "destructive";
    case "IN_PROGRESS": return "secondary"; // or a custom warning variant if available
    case "RESOLVED": return "default"; // green/primary usually
    case "CLOSED": return "outline";
    default: return "secondary";
  }
};

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case "URGENT": return "destructive";
    case "HIGH": return "destructive"; // or separate variant
    case "MEDIUM": return "secondary";
    case "LOW": return "outline";
    default: return "outline";
  }
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Tickets</h1>
            <p className="text-muted-foreground mt-1">
              Manage service requests and tickets
            </p>
          </div>
          <NewTicketDialog />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Tickets</CardTitle>
            <CardDescription>Refine your search by status or priority</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Status"
                value={status}
                onChange={(value) => setStatus(value)}
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
                onChange={(value) => setPriority(value)}
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
            <CardTitle>All Tickets</CardTitle>
            <CardDescription>
              Testing {tickets.length} total tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No tickets found</p>
              </div>
            ) : (
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">
                          {ticket.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(ticket.status) as any}>
                            {ticket.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityVariant(ticket.priority) as any}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {ticket.createdBy.name || ticket.createdBy.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {ticket.assignedTo
                            ? ticket.assignedTo.name || ticket.assignedTo.email
                            : "Unassigned"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/tickets/${ticket.id}`}>
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

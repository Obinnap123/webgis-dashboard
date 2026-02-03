"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TicketWithUser } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

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

export function RecentTickets() {
  const [tickets, setTickets] = useState<TicketWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      const response = await fetch("/api/dashboard/stats");
      const data = await response.json();

      if (data.success) {
        setTickets(data.data.recentTickets);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Recent Tickets</CardTitle>
          <CardDescription>Latest support requests</CardDescription>
        </div>
        <Link href="/tickets" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          View all <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No recent tickets</div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="grid gap-1">
                  <Link href={`/tickets/${ticket.id}`} className="font-semibold hover:underline">
                    {ticket.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    by {ticket.createdBy.name || ticket.createdBy.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Simplified badging for recent list - maybe just status */}
                  <Badge variant="outline" className="capitalize">
                    {ticket.status.toLowerCase().replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

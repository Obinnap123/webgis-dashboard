export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TicketWithUser {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  assignedTo: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
  ticketsByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
  recentTickets: TicketWithUser[];
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority?: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedToId?: string | null;
}

export interface CreateUserInput {
  email: string;
  name?: string;
  password: string;
  role?: string;
}

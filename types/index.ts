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

export interface AnalyticsOverview {
  totals: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
  };
  ticketsByStatus: {
    status: string;
    count: number;
  }[];
  ticketsByPriority: {
    priority: string;
    count: number;
  }[];
  ticketVolume: {
    date: string;
    count: number;
  }[];
  resolutionTrends: {
    period: string;
    avgHours: number;
  }[];
  agentPerformance: {
    agentId: string;
    agentName: string;
    assigned: number;
    resolved: number;
    open: number;
    avgResolutionHours: number;
  }[];
  summaries: {
    week: {
      created: number;
      resolved: number;
      avgResolutionHours: number;
    };
    month: {
      created: number;
      resolved: number;
      avgResolutionHours: number;
    };
  };
}

export interface DashboardOverview {
  kpis: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    avgResolutionHours: number;
  };
  ticketVolume: {
    date: string;
    count: number;
  }[];
  resolutionTrends: {
    period: string;
    avgHours: number;
  }[];
  ticketsByStatus: {
    status: string;
    count: number;
  }[];
  ticketsByPriority: {
    priority: string;
    count: number;
  }[];
  agentPerformance: {
    agentId: string;
    agentName: string;
    assigned: number;
    resolved: number;
    open: number;
    avgResolutionHours: number;
  }[];
  recentActivities: {
    id: string;
    action: string;
    previousValue: string | null;
    newValue: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
    ticket: {
      id: string;
      title: string;
      status: string;
      priority: string;
    };
  }[];
}

export interface AgentAnalytics {
  agents: {
    agentId: string;
    agentName: string;
    handled: number;
    resolved: number;
    open: number;
    avgResolutionHours: number;
  }[];
  topAgents: {
    agentId: string;
    agentName: string;
  }[];
  productivityTrends: Array<{
    period: string;
    [agentId: string]: string | number;
  }>;
}

export interface TicketAnalytics {
  daily: {
    date: string;
    count: number;
  }[];
  weekly: {
    period: string;
    count: number;
  }[];
  monthly: {
    period: string;
    count: number;
  }[];
  peakPeriods: {
    date: string;
    count: number;
  }[];
  categoryDistribution: {
    category: string;
    count: number;
  }[];
  resolutionTrends: {
    period: string;
    avgHours: number;
  }[];
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority?: string;
  assignedToId?: string | null;
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

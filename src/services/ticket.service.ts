import { api } from '@/api/axios';

export interface Ticket {
  _id: string;
  ticketNumber: number;
  subject: string;
  description: string;
  ticketType: 'feedback' | 'issue';
  status: 'open' | 'in progress' | 'resolved' | 'closed';
  statusDescription?: string;
  resolvedBy?: {
    _id: string;
    email: string;
    member_id?: {
      _id: string;
      name: string;
      email: string;
    } | null;
  } | null;
  statusUpdatedAt?: string | null;
  attachment?: string;
  createdAt: string;
  orgn_id: {
    _id: string;
    orgn_name: string;
    orgn_type: string;
  };
  createdBy: {
    _id: string;
    email: string;
    member_id?: {
      _id: string;
      name: string;
      email: string;
    } | null;
  };
}

export interface TicketFilters {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const ticketService = {
  getTicketCounter: async (): Promise<number> => {
    const { data } = await api.get('/tickets/counter');
    return data.data.lastTicketNumber;
  },

  createTicket: async (payload: {
    subject: string;
    description: string;
    ticketType: string;
    attachment?: string;
  }): Promise<Ticket> => {
    const { data } = await api.post('/tickets', payload);
    return data.data;
  },

  getTickets: async (filters?: TicketFilters): Promise<Ticket[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.search) params.set('search', filters.search);

    const url = `/tickets${params.toString() ? '?' + params.toString() : ''}`;
    const { data } = await api.get(url);
    return data.data;
  },

  updateStatus: async (id: string, status: string, statusDescription?: string): Promise<Ticket> => {
    const { data } = await api.patch(`/tickets/${id}/status`, {
      status,
      statusDescription,
    });
    return data.data;
  },
};

import { api } from '@/api/axios';

export interface Ticket {
  _id: string;
  subject: string;
  description: string;
  ticketType: 'feedback' | 'issue';
  status: 'open' | 'in progress' | 'resolved' | 'closed';
  attachment?: string;
  createdAt: string;
  orgn_id: {
    _id: string;
    orgn_name: string;
    orgn_type: string;
  };
  createdBy: {
    _id: string;
    name?: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export const ticketService = {
  createTicket: async (payload: {
    subject: string;
    description: string;
    ticketType: string;
    attachment?: string;
  }): Promise<Ticket> => {
    const { data } = await api.post('/tickets', payload);
    return data.data;
  },
  getTickets: async (type?: string): Promise<Ticket[]> => {
    const url = type ? `/tickets?type=${type}` : '/tickets';
    const { data } = await api.get(url);
    return data.data;
  },
  updateStatus: async (id: string, status: string): Promise<Ticket> => {
    const { data } = await api.patch(`/tickets/${id}/status`, { status });
    return data.data;
  },
};

import React, { useEffect, useState } from 'react';
import { ticketService, Ticket } from '@/services/ticket.service';
import { useAuth } from '@/context/auth/useAuth';
import { FileText, Loader2, RefreshCw, X } from 'lucide-react';

export const MyReports = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const roleName = user?.role_id?.name?.toLowerCase() || '';
  const isPmuAdmin = roleName === 'pmu admin' || roleName === 'pmu_admin';

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ticketService.getTickets();
      setTickets(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await ticketService.updateStatus(id, status);
      setTickets((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: status as Ticket['status'] } : t)),
      );
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-700';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'issue'
      ? 'bg-red-50 text-red-600 border border-red-200'
      : 'bg-indigo-50 text-indigo-600 border border-indigo-200';
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white shadow-md">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
            <p className="text-sm text-gray-500">
              View and track your submitted feedback and issues.
            </p>
          </div>
        </div>
        <button
          onClick={fetchTickets}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="cursor-pointer transition hover:bg-gray-50/50"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{ticket.subject}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${getTypeColor(
                          ticket.ticketType,
                        )}`}
                      >
                        {ticket.ticketType}
                      </span>
                    </td>
                    <td className="max-w-xs px-6 py-4 text-gray-500">
                      <p className="truncate">{ticket.description}</p>
                      {ticket.attachment && (
                        <a
                          href={ticket.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block text-xs text-indigo-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Attachment
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      {ticket.ticketType === 'feedback' ? (
                        <span className="text-gray-400 italic">No Status</span>
                      ) : isPmuAdmin ? (
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="open">Open</option>
                          <option value="in progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${getStatusColor(
                            ticket.status,
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Ticket Details</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                    Ticket Type
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${getTypeColor(selectedTicket.ticketType)}`}
                  >
                    {selectedTicket.ticketType}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                    Status
                  </p>
                  {selectedTicket.ticketType === 'feedback' ? (
                    <span className="mt-1 block text-sm text-gray-400 italic">No Status</span>
                  ) : (
                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${getStatusColor(selectedTicket.status)}`}
                    >
                      {selectedTicket.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                  Subject
                </p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {selectedTicket.subject}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                  Description
                </p>
                <div className="mt-1 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                  {selectedTicket.description}
                </div>
              </div>

              {selectedTicket.attachment && (
                <div className="mb-6">
                  <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                    Attachment
                  </p>
                  <a
                    href={selectedTicket.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm text-indigo-600 hover:underline"
                  >
                    View Attachment
                  </a>
                </div>
              )}

              <div className="grid gap-6 rounded-xl border border-gray-100 bg-gray-50 p-5 md:grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                    User Details
                  </p>
                  <div className="mt-2 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">
                      {selectedTicket.createdBy?.first_name
                        ? `${selectedTicket.createdBy.first_name} ${selectedTicket.createdBy.last_name || ''}`
                        : selectedTicket.createdBy?.name || 'Unknown User'}
                    </p>
                    <p>{selectedTicket.createdBy?.email}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      ID: {selectedTicket.createdBy?._id}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                    Organization Details
                  </p>
                  <div className="mt-2 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">
                      {selectedTicket.orgn_id?.orgn_name || 'N/A'}
                    </p>
                    <p className="inline-flex rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-700 uppercase">
                      Type: {selectedTicket.orgn_id?.orgn_type || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

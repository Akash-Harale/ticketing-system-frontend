import React, { useEffect, useState, useCallback } from 'react';
import { ticketService, Ticket, TicketFilters } from '@/services/ticket.service';
import { useAuth } from '@/context/auth/useAuth';
import * as XLSX from 'xlsx';
import {
  FileText,
  Loader2,
  RefreshCw,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Hash,
  Download,
} from 'lucide-react';

// Lucide v0.x does not export Ticket icon — using a simple SVG fallback
const TicketIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2M13 17v2M13 11v2" />
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────────

const toDateStr = (d: Date) => d.toISOString().split('T')[0];

const todayStr = () => toDateStr(new Date());

const oneMonthAgoStr = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return toDateStr(d);
};

const statusMeta: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  open: {
    label: 'Open',
    cls: 'bg-blue-50 text-blue-700 border border-blue-200',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  'in progress': {
    label: 'In Progress',
    cls: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon: <Clock className="h-3 w-3" />,
  },
  resolved: {
    label: 'Resolved',
    cls: 'bg-green-50 text-green-700 border border-green-200',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  closed: {
    label: 'Closed',
    cls: 'bg-gray-100 text-gray-600 border border-gray-300',
    icon: <XCircle className="h-3 w-3" />,
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const meta = statusMeta[status] || statusMeta['open'];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${meta.cls}`}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// ── Main Component ────────────────────────────────────────────────────────────

export const MyReports = () => {
  const { user } = useAuth();

  const roleName = (user?.role_id?.name || '').toLowerCase();
  const isAdmin = ['superadmin', 'nss admin', 'nss_admin', 'pmu admin', 'pmu_admin'].includes(
    roleName,
  );

  // Tabs
  const [activeTab, setActiveTab] = useState<'tickets' | 'feedback'>('tickets');

  // Tickets list state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search / Filter / Sort
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [startDate, setStartDate] = useState(oneMonthAgoStr());
  const [endDate, setEndDate] = useState(todayStr());

  // Drawer
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [drawerStatus, setDrawerStatus] = useState('');
  const [statusDesc, setStatusDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const currentType = activeTab === 'tickets' ? 'issue' : 'feedback';

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const filters: TicketFilters = {
        type: currentType,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: search || undefined,
      };
      const data = await ticketService.getTickets(filters);
      // Client-side sort
      const sorted = [...data].sort((a, b) => {
        const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? -diff : diff;
      });
      setTickets(sorted);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, [currentType, statusFilter, startDate, endDate, search, sortOrder]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // When drawer opens, pre-fill status
  useEffect(() => {
    if (selected) {
      setDrawerStatus(selected.status);
      setStatusDesc('');
      setSubmitError('');
      setSubmitSuccess('');
    }
  }, [selected]);

  const handleStatusSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const updated = await ticketService.updateStatus(selected._id, drawerStatus, statusDesc);
      setTickets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setSelected(updated);
      setSubmitSuccess('Status updated successfully!');
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setSubmitError(e.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const isCreator = selected ? String(selected.createdBy?._id) === String(user?._id) : false;

  const statusChanged = selected && drawerStatus !== selected.status;

  const handleExport = () => {
    if (tickets.length === 0) return;

    const exportData = tickets.map((t) => {
      const row: Record<string, string | number> = {};
      if (activeTab === 'tickets') {
        row['Ticket No.'] = t.ticketNumber ?? '—';
      }
      row['Created Date'] = fmt(t.createdAt);
      row['Title'] = t.subject;
      row['Created By'] = t.createdBy?.member_id?.name || t.createdBy?.email || 'Unknown';
      row['Organization'] = t.orgn_id?.orgn_name || 'N/A';

      if (activeTab === 'tickets') {
        row['Status'] = t.status;
        row['Priority'] = t.priority || 'Low';
      }

      row['Description'] = t.description;
      if (activeTab === 'tickets') {
        row['Admin Note'] = t.statusDescription || '';
      }
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === 'tickets' ? 'Tickets' : 'Feedback');
    XLSX.writeFile(wb, `${activeTab}_${todayStr()}.xlsx`);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white shadow-md">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
            <p className="text-sm text-gray-500">Track your submitted tickets and feedback.</p>
          </div>
        </div>
        <button
          onClick={fetchTickets}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
        {[
          { key: 'tickets', label: 'Tickets', icon: <TicketIcon className="h-4 w-4" /> },
          { key: 'feedback', label: 'Feedback', icon: <MessageSquare className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'tickets' | 'feedback')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === 'tickets' ? 'Search tickets…' : 'Search feedback…'}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Status Filter */}
        {activeTab === 'tickets' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        )}

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <span className="text-sm text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Sort */}
        <button
          onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          title="Toggle sort order"
        >
          {sortOrder === 'desc' ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
          {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </button>

        {/* Reset */}
        {(search || statusFilter || startDate !== oneMonthAgoStr() || endDate !== todayStr()) && (
          <button
            onClick={() => {
              setStatusFilter('');
              setSearch('');
              setStartDate(oneMonthAgoStr());
              setEndDate(todayStr());
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
          >
            Reset
          </button>
        )}

        {/* Download */}
        <button
          onClick={handleExport}
          disabled={tickets.length === 0}
          className="ml-auto flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
          title="Download as Excel"
        >
          <Download className="h-4 w-4" />
          Download Excel
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                {activeTab === 'tickets' && <th className="px-5 py-4">Ticket No.</th>}
                <th className="px-5 py-4">Created Date</th>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Created By</th>
                {activeTab === 'tickets' && (
                  <>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Priority</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={activeTab === 'tickets' ? 6 : 3}
                    className="py-16 text-center text-gray-400"
                  >
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    <p className="mt-2 text-sm">Loading…</p>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === 'tickets' ? 6 : 3}
                    className="py-16 text-center text-gray-400"
                  >
                    <FileText className="mx-auto h-8 w-8 opacity-30" />
                    <p className="mt-2 text-sm">
                      No {activeTab === 'tickets' ? 'tickets' : 'feedback'} found.
                    </p>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="cursor-pointer transition-colors hover:bg-indigo-50/40"
                    onClick={() => setSelected(ticket)}
                  >
                    {activeTab === 'tickets' && (
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-indigo-600">
                          <Hash className="h-3 w-3" />
                          {ticket.ticketNumber ?? '—'}
                        </span>
                      </td>
                    )}
                    <td className="px-5 py-4 text-xs text-gray-500">{fmt(ticket.createdAt)}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">{ticket.subject}</td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-medium text-gray-900">
                        {ticket.createdBy?.member_id?.name || ticket.createdBy?.email || 'Unknown'}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {ticket.orgn_id?.orgn_name || 'N/A'}
                      </p>
                    </td>
                    {activeTab === 'tickets' && (
                      <>
                        <td className="px-5 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="px-5 py-4 text-xs font-medium text-gray-700 capitalize">
                          {ticket.priority || 'Low'}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Drawer ──────────────────────────────────────────────────────────── */}
      {selected && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />

          {/* Panel */}
          <div className="fixed top-0 right-0 z-50 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                {activeTab === 'tickets' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 font-mono text-xs font-bold text-indigo-700">
                    <Hash className="h-3 w-3" />
                    {selected.ticketNumber ?? '—'}
                  </span>
                )}
                <h2 className="text-base font-bold text-gray-900">
                  {activeTab === 'tickets' ? 'Ticket Details' : 'Feedback Details'}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {/* Title */}
              <div>
                <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  Title
                </p>
                <p className="mt-1 text-base font-semibold text-gray-900">{selected.subject}</p>
              </div>

              {/* Status & Priority */}
              {activeTab === 'tickets' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                      Status
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={selected.status} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                      Priority
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-800 capitalize">
                      {selected.priority || 'Low'}
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  Description
                </p>
                <div className="mt-1 rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                  {selected.description}
                </div>
              </div>

              {/* Status Description (if any) */}
              {selected.statusDescription && (
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Admin Note
                  </p>
                  <div className="mt-1 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
                    {selected.statusDescription}
                  </div>
                </div>
              )}

              {/* Resolved / Updated By */}
              {selected.resolvedBy && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <p className="mb-2 text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
                    {selected.status === 'resolved'
                      ? 'Resolved By'
                      : selected.status === 'closed'
                        ? 'Closed By'
                        : 'Status Updated By'}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                      {(
                        selected.resolvedBy.member_id?.name?.[0] ||
                        selected.resolvedBy.email?.[0] ||
                        '?'
                      ).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-indigo-900">
                        {selected.resolvedBy.member_id?.name || selected.resolvedBy.email}
                      </p>
                      <p className="text-xs text-indigo-600">
                        {selected.resolvedBy.member_id?.email || selected.resolvedBy.email}
                      </p>
                      {selected.statusUpdatedAt && (
                        <p className="mt-0.5 text-[11px] text-indigo-400">
                          {new Date(selected.statusUpdatedAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Attachment */}
              {selected.attachment && (
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Attachment
                  </p>
                  <a
                    href={selected.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm text-indigo-600 hover:underline"
                  >
                    View Attachment ↗
                  </a>
                </div>
              )}

              {/* Meta */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Created By
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {selected.createdBy?.member_id?.name || selected.createdBy?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selected.createdBy?.member_id?.email || selected.createdBy?.email}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Created Date
                  </p>
                  <p className="mt-1 text-sm text-gray-700">{fmt(selected.createdAt)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Organization
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {selected.orgn_id?.orgn_name || 'N/A'}
                  </p>
                  <span className="inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-700 uppercase">
                    {selected.orgn_id?.orgn_type || 'N/A'}
                  </span>
                </div>
              </div>

              {/* ── Status Change Section ── */}
              {activeTab === 'tickets' && (
                <>
                  {/* Admin can change status; creator can only close */}
                  {(isAdmin || isCreator) &&
                    selected.status !== 'closed' &&
                    selected.status !== 'resolved' && (
                      <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                        <p className="text-sm font-semibold text-gray-800">
                          {isAdmin ? 'Update Ticket Status' : 'Close Ticket'}
                        </p>

                        {isAdmin && (
                          <select
                            value={drawerStatus}
                            onChange={(e) => setDrawerStatus(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          >
                            <option value="open">Open</option>
                            <option value="in progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        )}

                        {/* Creator close button (non-admin) */}
                        {!isAdmin && isCreator && (
                          <button
                            onClick={() => setDrawerStatus('closed')}
                            className={`w-full rounded-lg border px-4 py-2 text-sm font-semibold transition ${drawerStatus === 'closed' ? 'border-gray-400 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                          >
                            {drawerStatus === 'closed' ? '✓ Marked as Closed' : 'Close this Ticket'}
                          </button>
                        )}

                        {/* Description box — shown when status is being changed */}
                        {statusChanged && (
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                              {isAdmin
                                ? 'Add a note / reason (optional)'
                                : 'Closing reason (optional)'}
                            </label>
                            <textarea
                              rows={3}
                              value={statusDesc}
                              onChange={(e) => setStatusDesc(e.target.value)}
                              placeholder="e.g. Issue has been resolved in the latest update…"
                              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                            />
                          </div>
                        )}

                        {submitError && (
                          <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                            {submitError}
                          </p>
                        )}
                        {submitSuccess && (
                          <p className="rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-700">
                            {submitSuccess}
                          </p>
                        )}

                        {statusChanged && (
                          <button
                            onClick={handleStatusSubmit}
                            disabled={submitting}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                          >
                            {submitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            {submitting ? 'Updating…' : 'Submit Status'}
                          </button>
                        )}
                      </div>
                    )}

                  {(selected.status === 'closed' || selected.status === 'resolved') && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center text-sm text-gray-500">
                      This ticket is <span className="font-semibold">{selected.status}</span> and
                      cannot be modified further.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

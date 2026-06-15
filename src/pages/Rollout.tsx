import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Search,
  X,
  Plus,
  MapPin,
  Building2,
  Send,
  FileText,
  GraduationCap,
  CheckCircle2,
  Clock,
  FileEdit,
  Loader2,
} from 'lucide-react';
import { TemplateModal } from '../features/rollout/components/TemplateModal';
import { AddRolloutModal } from '../features/rollout/components/AddRolloutModal';
import {
  rolloutService,
  RolloutCampaign,
  StateEntry,
  DistrictEntry,
  InstituteEntry,
} from '@/services/rollout.service';

/* ── STATUS BADGE ── */
const STATUS: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Completed: 'bg-indigo-100 text-indigo-700',
  Draft: 'bg-amber-100 text-amber-700',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  Active: <CheckCircle2 className="h-3 w-3" />,
  Completed: <CheckCircle2 className="h-3 w-3" />,
  Draft: <FileEdit className="h-3 w-3" />,
};

/* ── INSTITUTE TYPE ICON ── */
const typeIcon = (type: string) => {
  if (type === 'University') return <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />;
  if (type === 'College') return <Building2 className="h-3.5 w-3.5 text-violet-400" />;
  return <Building2 className="h-3.5 w-3.5 text-emerald-400" />;
};
const typeBadge = (type: string) => {
  if (type === 'University') return 'bg-indigo-50 text-indigo-600';
  if (type === 'College') return 'bg-violet-50 text-violet-600';
  return 'bg-emerald-50 text-emerald-600';
};

/* ── DISTRICT PANEL ── */
const DistrictPanel = ({ district }: { district: DistrictEntry }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-all">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${open ? 'bg-indigo-50/60' : 'hover:bg-gray-50'}`}
      >
        <MapPin className={`h-4 w-4 flex-shrink-0 ${open ? 'text-indigo-500' : 'text-gray-400'}`} />
        <span
          className={`flex-1 text-sm font-semibold ${open ? 'text-indigo-700' : 'text-gray-800'}`}
        >
          {district.name}
        </span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
          {district.institutes.length}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-indigo-100 bg-indigo-50/30 px-4 py-3">
          <p className="mb-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
            Institutes / Colleges
          </p>
          <div className="flex flex-col gap-1.5">
            {district.institutes.map((inst) => (
              <div
                key={inst.id}
                className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white px-3 py-2.5"
              >
                {typeIcon(inst.type)}
                <span className="flex-1 text-[13px] font-medium text-gray-800">{inst.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeBadge(inst.type)}`}
                >
                  {inst.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── STATE PANEL ── */
const StatePanel = ({ state }: { state: StateEntry }) => {
  const [open, setOpen] = useState(false);
  const totalInst = state.districts.reduce((s, d) => s + d.institutes.length, 0);
  const initials = state.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition ${open ? 'border-b border-indigo-100 bg-indigo-50/50' : 'hover:bg-gray-50'}`}
      >
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[12px] font-bold transition ${open ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}
        >
          {initials}
        </div>
        <div className="flex-1 text-left">
          <p className={`text-sm font-semibold ${open ? 'text-indigo-700' : 'text-gray-800'}`}>
            {state.name}
          </p>
          <p className="text-[11px] text-gray-400">
            {state.districts.length} district{state.districts.length !== 1 ? 's' : ''} · {totalInst}{' '}
            institute{totalInst !== 1 ? 's' : ''}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-2 border-t border-indigo-100 bg-indigo-50/20 px-4 py-3">
          {state.districts.map((d) => (
            <DistrictPanel key={d.id} district={d} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── ROLLOUT ACCORDION ── */
const RolloutAccordion = ({
  rollout,
  isOpen,
  onToggle,
}: {
  rollout: RolloutCampaign;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div
    className={`overflow-hidden rounded-2xl border transition-all duration-300 ${isOpen ? 'border-indigo-200 bg-indigo-50/40 shadow-md shadow-indigo-100' : 'border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm'}`}
  >
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-4 px-6 py-5 text-left focus:outline-none"
    >
      {/* Icon */}
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition ${isOpen ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-indigo-100 text-indigo-600'}`}
      >
        <Send className="h-5 w-5" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={`text-[15px] font-bold ${isOpen ? 'text-indigo-700' : 'text-gray-900'}`}>
            {rollout.title}
          </p>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS[rollout.status] || 'bg-indigo-100 text-indigo-700'}`}
          >
            {STATUS_ICON[rollout.status] || <CheckCircle2 className="h-3 w-3" />}
            {rollout.status}
          </span>
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-gray-400">
          <FileText className="h-3 w-3" />
          {rollout.templateName}
          <span className="mx-1">·</span>
          <Clock className="h-3 w-3" />
          {rollout.sentDate}
        </p>
      </div>

      {/* Stats */}
      <div className="hidden items-center gap-3 text-[12px] text-gray-400 sm:flex">
        <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-semibold">
          {rollout.totalStates} states
        </span>
        <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-semibold">
          {rollout.totalInstitutes} institutes
        </span>
      </div>

      <ChevronDown
        className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>

    {/* Body */}
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'}`}
    >
      <div className="border-t border-indigo-100 px-6 py-5">
        <div className="mb-3 flex items-center gap-2">
          <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            States &amp; Districts
          </p>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
            {rollout.states.length}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {rollout.states.map((s) => (
            <StatePanel key={s.id} state={s} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ── MAIN PAGE ── */
export const Rollout = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showRollout, setShowRollout] = useState(false);
  const [rollouts, setRollouts] = useState<RolloutCampaign[]>([]);
  const [templatesCount, setTemplatesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchRolloutsAndTemplates = async () => {
    setLoading(true);
    try {
      const [rData, tData] = await Promise.all([
        rolloutService.getRollouts(),
        rolloutService.getMasterTemplates(),
      ]);
      setRollouts(rData);
      setTemplatesCount(tData.length > 0 ? 1 : 0);
    } catch (err) {
      console.error('Failed to load rollouts/templates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolloutsAndTemplates();
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearchQuery('');
  }, [searchOpen]);

  const q = searchQuery.toLowerCase();
  const filtered = useMemo(
    () =>
      q
        ? rollouts.filter(
            (r) =>
              r.title.toLowerCase().includes(q) ||
              r.templateName.toLowerCase().includes(q) ||
              r.status.toLowerCase().includes(q) ||
              (r.states as StateEntry[]).some(
                (s: StateEntry) =>
                  s.name.toLowerCase().includes(q) ||
                  s.districts.some(
                    (d: DistrictEntry) =>
                      d.name.toLowerCase().includes(q) ||
                      d.institutes.some((i: InstituteEntry) => i.name.toLowerCase().includes(q)),
                  ),
              ),
          )
        : rollouts,
    [q, rollouts],
  );

  const handleTemplateSave = () => {
    fetchRolloutsAndTemplates();
    setShowTemplate(false);
  };

  const handleRolloutSubmit = () => {
    fetchRolloutsAndTemplates();
    setShowRollout(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6 rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Rollout Management</h1>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Manage and track NSS rollouts across states and districts
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <div className="flex items-center gap-2 rounded-xl border border-indigo-300 bg-white px-3 py-2 shadow-md ring-1 ring-indigo-100">
                <Search className="h-4 w-4 flex-shrink-0 text-indigo-400" />
                <input
                  ref={searchRef}
                  id="rollout-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rollouts…"
                  className="w-44 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="ml-1 rounded-full p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="rollout-search-open"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md"
              >
                <Search className="h-4 w-4" /> Search
              </button>
            )}

            {/* +Template */}
            <button
              id="add-template-btn"
              onClick={() => setShowTemplate(true)}
              className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 hover:shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Template</span>
            </button>

            {/* +Rollout */}
            <button
              id="add-rollout-btn"
              onClick={() => setShowRollout(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Rollout</span>
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap gap-3 border-t border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5">
            <p className="text-[10px] font-semibold tracking-wide text-indigo-400 uppercase">
              Total Rollouts
            </p>
            <p className="ml-1 text-[14px] font-bold text-indigo-700">{rollouts.length}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5">
            <p className="text-[10px] font-semibold tracking-wide text-emerald-400 uppercase">
              Active
            </p>
            <p className="ml-1 text-[14px] font-bold text-emerald-700">
              {rollouts.filter((r) => r.status === 'Active').length}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5">
            <p className="text-[10px] font-semibold tracking-wide text-violet-400 uppercase">
              Completed
            </p>
            <p className="ml-1 text-[14px] font-bold text-violet-700">
              {rollouts.filter((r) => r.status === 'Completed').length}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5">
            <p className="text-[10px] font-semibold tracking-wide text-amber-400 uppercase">
              Templates
            </p>
            <p className="ml-1 text-[14px] font-bold text-amber-700">{templatesCount}</p>
          </div>
        </div>
      </div>

      {/* Rollout list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white py-16 text-center shadow-sm">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <Search className="h-9 w-9 text-gray-300" />
            <div className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-400 ring-2 ring-white">
              <X className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-gray-800">No rollouts found</p>
            <p className="mt-1 text-[13px] text-gray-400">
              {searchQuery ? (
                <>
                  No results for{' '}
                  <span className="font-semibold text-gray-600">"{searchQuery}"</span>
                </>
              ) : (
                'Create a new rollout campaign by clicking the button above.'
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((r) => (
            <RolloutAccordion
              key={r.id}
              rollout={r}
              isOpen={openId === r.id}
              onToggle={() => setOpenId((prev) => (prev === r.id ? null : r.id))}
            />
          ))}
        </div>
      )}

      <TemplateModal
        isOpen={showTemplate}
        onClose={() => setShowTemplate(false)}
        onSubmit={handleTemplateSave}
      />
      <AddRolloutModal
        isOpen={showRollout}
        onClose={() => setShowRollout(false)}
        onSubmit={handleRolloutSubmit}
      />
    </div>
  );
};

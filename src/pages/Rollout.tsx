import React, { useState, useMemo, useRef, useEffect } from 'react';
import { api } from '@/api/axios';
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
import { CreateRollout, ChipSelect } from './CreateRollout';
import { locationService, State, District } from '@/services/location.service';
import {
  rolloutService,
  RolloutCampaign,
  StateEntry,
  DistrictEntry,
  InstituteEntry,
  CoordinatorRollout,
  RolloutTask,
} from '@/services/rollout.service';
import { useAuth } from '@/context/auth/useAuth';

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
  onUpdateSuccess,
}: {
  rollout: RolloutCampaign;
  isOpen: boolean;
  onToggle: () => void;
  onUpdateSuccess: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [dbStates, setDbStates] = useState<State[]>([]);
  const [allDistricts, setAllDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<{ _id: string; orgn_name: string; orgn_type: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-populate target list with currently active targets when entering edit mode
  useEffect(() => {
    if (isEditing) {
      const initialStates = rollout.states.map((s) => s.name);
      const initialDistricts: string[] = [];
      rollout.states.forEach((s) => {
        s.districts.forEach((d) => {
          initialDistricts.push(d.name);
        });
      });
      setSelectedStates(initialStates);
      setSelectedDistricts(initialDistricts);
      setErrorMsg('');
    }
  }, [isEditing, rollout]);

  useEffect(() => {
    if (isEditing) {
      locationService
        .getStates()
        .then(setDbStates)
        .catch((err: unknown) => console.error('Failed to load states', err));
    }
  }, [isEditing]);

  useEffect(() => {
    if (dbStates.length === 0 || selectedStates.length === 0) {
      setAllDistricts([]);
      if (selectedStates.length === 0) {
        setSelectedDistricts([]);
      }
      return;
    }
    const selectedStateIds = selectedStates
      .map((name) => dbStates.find((s) => s.state_name === name)?._id)
      .filter(Boolean) as string[];

    if (selectedStateIds.length === 0) return;

    Promise.all(selectedStateIds.map((id) => locationService.getDistrictsByState(id)))
      .then((results) => {
        const flatDistricts = results.flat();
        setAllDistricts(flatDistricts);
        const validNames = flatDistricts.map((d) => d.district_name);
        setSelectedDistricts((prev) => prev.filter((d) => validNames.includes(d)));
      })
      .catch((err: unknown) => console.error('Failed to load districts', err));
  }, [selectedStates, dbStates]);

  const stateOptions = useMemo(() => dbStates.map((s) => s.state_name).sort(), [dbStates]);

  const districtOptions = useMemo(() => {
    return [...new Set(allDistricts.map((d) => d.district_name))].sort();
  }, [allDistricts]);

  const handleStateChange = (newStates: string[]) => {
    setSelectedStates(newStates);
  };

  useEffect(() => {
    if (selectedDistricts.length === 0) {
      setUnits([]);
      return;
    }
    const fetchPreview = async () => {
      try {
        const { data } = await api.post('/organizations/preview-pu', {
          states: selectedStates,
          districts: selectedDistricts,
        });
        setUnits(data.data || []);
      } catch (err: unknown) {
        console.error('Failed to fetch preview units', err);
      }
    };
    fetchPreview();
  }, [selectedDistricts, selectedStates]);

  const handleSaveTargets = async () => {
    if (selectedStates.length === 0 || selectedDistricts.length === 0) {
      setErrorMsg('Please select at least one state and district.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await rolloutService.addCampaignTargets(rollout.id, {
        states: selectedStates,
        districts: selectedDistricts,
      });
      setIsEditing(false);
      setSelectedStates([]);
      setSelectedDistricts([]);
      setUnits([]);
      onUpdateSuccess();
    } catch (err: unknown) {
      let msg = 'Failed to update campaign targets.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          msg = axiosError.response.data.message;
        }
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <div className="grid grid-cols-1 gap-6 border-t border-indigo-100 px-6 py-5 md:grid-cols-2">
          {/* Left Column: Scope */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
                  States &amp; Districts Scope
                </p>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
                  {rollout.states.length}
                </span>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 transition hover:text-indigo-700"
                >
                  <Plus className="h-3 w-3" /> Add Targets
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="flex flex-col gap-3">
                {rollout.states.map((s) => (
                  <StatePanel key={s.id} state={s} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 rounded-xl border border-dashed border-indigo-200 bg-white p-4">
                <p className="text-xs font-semibold text-indigo-900">
                  Add States &amp; Districts Target
                </p>

                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-2.5 text-xs text-red-800">
                    <X className="h-4 w-4 flex-shrink-0 text-red-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <ChipSelect
                  label="Select Additional States *"
                  options={stateOptions}
                  selected={selectedStates}
                  onChange={handleStateChange}
                  placeholder="Choose states…"
                />

                <ChipSelect
                  label="Select Additional Districts *"
                  options={districtOptions}
                  selected={selectedDistricts}
                  onChange={setSelectedDistricts}
                  placeholder={
                    selectedStates.length === 0 ? 'Select states first' : 'Choose districts…'
                  }
                  disabled={selectedStates.length === 0}
                />

                {units.length > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    <span>
                      Found <strong>{units.length}</strong> program units in selected areas.
                    </span>
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t border-gray-100 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedStates([]);
                      setSelectedDistricts([]);
                      setUnits([]);
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTargets}
                    disabled={loading || selectedDistricts.length === 0}
                    className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                    {loading ? 'Adding…' : 'Add to Campaign'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Assigned Tasks (Master Template) */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
                Assigned Tasks (Master Template)
              </p>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
                {rollout.tasks?.length || 0}
              </span>
            </div>

            <div className="border-gray-150 overflow-hidden rounded-xl border bg-white shadow-sm">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-gray-150 border-b bg-gray-50 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    <th className="px-3 py-2.5">Task Name</th>
                    <th className="w-24 px-3 py-2.5 text-center">Priority</th>
                    <th className="w-36 px-3 py-2.5 text-center">Planned Dates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rollout.tasks && rollout.tasks.length > 0 ? (
                    rollout.tasks.map((task, i) => (
                      <tr key={i} className="text-sm hover:bg-gray-50/50">
                        <td className="px-3 py-3">
                          <p className="text-xs font-semibold text-gray-800">{task.task_name}</p>
                          {task.task_desc && (
                            <p className="mt-0.5 line-clamp-1 text-[11px] leading-relaxed text-gray-400">
                              {task.task_desc}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              task.task_priority === 'High'
                                ? 'border border-red-100 bg-red-50 text-red-600'
                                : task.task_priority === 'Medium'
                                  ? 'border border-amber-100 bg-amber-50 text-amber-600'
                                  : 'border border-blue-100 bg-blue-50 text-blue-600'
                            }`}
                          >
                            {task.task_priority}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-[10px] text-gray-500">
                          {task.planned_start_date ? (
                            <div className="flex items-center justify-center gap-1">
                              <span>
                                {new Date(task.planned_start_date).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                })}
                              </span>
                              <span className="text-gray-300">→</span>
                              <span>
                                {task.planned_end_date
                                  ? new Date(task.planned_end_date).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                    })
                                  : 'No end'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Not scheduled</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-xs text-gray-400 italic">
                        No tasks assigned.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── COORDINATOR TASK ROW ── */
interface CoordinatorTaskRowProps {
  task: RolloutTask & { campaignTitle: string };
  orgId: string;
  onSaveSuccess: () => void;
}

const CoordinatorTaskRow = ({ task, orgId, onSaveSuccess }: CoordinatorTaskRowProps) => {
  const [status, setStatus] = useState(task.task_status);
  const [actualStart, setActualStart] = useState(
    task.actual_start_date ? new Date(task.actual_start_date).toISOString().split('T')[0] : '',
  );
  const [actualEnd, setActualEnd] = useState(
    task.actual_end_date ? new Date(task.actual_end_date).toISOString().split('T')[0] : '',
  );
  const [remarks, setRemarks] = useState(task.tracking_comments || '');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const initialStart = task.actual_start_date
    ? new Date(task.actual_start_date).toISOString().split('T')[0]
    : '';
  const initialEnd = task.actual_end_date
    ? new Date(task.actual_end_date).toISOString().split('T')[0]
    : '';
  const initialRemarks = task.tracking_comments || '';
  const isLocked = task.task_status === 'Complete' || task.task_status === 'Closed';

  const hasChanges =
    !isLocked &&
    (status !== task.task_status ||
      actualStart !== initialStart ||
      actualEnd !== initialEnd ||
      remarks !== initialRemarks);

  const handleSave = async () => {
    if (isLocked) return;
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    if (!actualStart) {
      setErrorMsg('Actual start date is required');
      return;
    }
    if (!actualEnd) {
      setErrorMsg('Actual end date is required');
      return;
    }

    if (!task.planned_start_date) {
      setErrorMsg('Planned start date is missing for this task');
      return;
    }

    const pStart = new Date(task.planned_start_date);
    const pEnd = task.planned_end_date ? new Date(task.planned_end_date) : null;
    const aStart = new Date(actualStart);
    const aEnd = new Date(actualEnd);

    // Enforce business rules:
    // 1. planned end date should not be less than the planned start date
    if (pEnd && pEnd < pStart) {
      setErrorMsg('Planned end date cannot be less than planned start date');
      return;
    }

    // 2. actual start date should not be less than planned start date
    if (aStart < pStart) {
      setErrorMsg('Actual start date cannot be less than planned start date');
      return;
    }

    // 3. actual end date should not be less than actual start date
    if (aEnd < aStart) {
      setErrorMsg('Actual end date cannot be less than actual start date');
      return;
    }

    setSaving(true);
    try {
      await rolloutService.updateTaskForOrg(orgId, task.task_id, {
        task_status: status,
        actual_start_date: new Date(actualStart).toISOString(),
        actual_end_date: new Date(actualEnd).toISOString(),
        tracking_comments: remarks.trim(),
      });
      setSuccessMsg('Saved!');
      setTimeout(() => setSuccessMsg(''), 3000);
      onSaveSuccess();
    } catch (err: unknown) {
      let msg = 'Failed to update task';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          msg = axiosError.response.data.message;
        }
      }
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const priorityStyles: Record<string, string> = {
    High: 'bg-red-100 border border-red-200 text-red-700',
    Medium: 'bg-amber-100 border border-amber-200 text-amber-700',
    Low: 'bg-emerald-100 border border-emerald-200 text-emerald-700',
  };

  return (
    <>
      <tr className={`hover:bg-gray-50/50 ${isLocked ? 'bg-gray-50/30' : ''}`}>
        <td className="px-4 py-4 align-top">
          <span className="text-indigo-755 mb-1 inline-block rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold">
            {task.campaignTitle}
          </span>
          <div className="flex items-center gap-2">
            <p
              className={`font-semibold ${isLocked ? 'text-gray-500 line-through' : 'text-gray-800'}`}
            >
              {task.task_name}
            </p>
            {isLocked && (
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-gray-500 uppercase">
                Locked
              </span>
            )}
          </div>
          {task.task_desc && (
            <p className="mt-1 text-xs leading-relaxed text-gray-400">{task.task_desc}</p>
          )}
        </td>
        <td className="px-4 py-4 align-top">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityStyles[task.task_priority] || 'bg-gray-100 text-gray-600'}`}
          >
            {task.task_priority}
          </span>
        </td>
        <td className="px-4 py-4 align-top text-xs whitespace-nowrap text-gray-600">
          <div className="space-y-1">
            <p>
              <span className="font-semibold text-gray-400">Planned Start:</span>{' '}
              {task.planned_start_date
                ? new Date(task.planned_start_date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </p>
            <p>
              <span className="font-semibold text-gray-400">Planned End:</span>{' '}
              {task.planned_end_date
                ? new Date(task.planned_end_date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </td>
        <td className="space-y-2 px-4 py-4 align-top">
          <div className="flex flex-col">
            <label className="mb-1 text-[9px] font-bold tracking-wider text-gray-400 uppercase">
              Actual Start *
            </label>
            <input
              type="date"
              value={actualStart}
              onChange={(e) => setActualStart(e.target.value)}
              disabled={isLocked}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 transition outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-[9px] font-bold tracking-wider text-gray-400 uppercase">
              Actual End *
            </label>
            <input
              type="date"
              value={actualEnd}
              onChange={(e) => setActualEnd(e.target.value)}
              disabled={isLocked}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 transition outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
        </td>
        <td className="px-4 py-4 align-top">
          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value as 'Open' | 'Pending' | 'In-progress' | 'Complete' | 'Closed',
              )
            }
            disabled={isLocked}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="Open">Open</option>
            <option value="Pending">Pending</option>
            <option value="In-progress">In-progress</option>
            <option value="Complete">Complete</option>
            <option value="Closed">Closed</option>
          </select>
        </td>
        <td className="px-4 py-4 align-top">
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={isLocked}
            placeholder={isLocked ? 'Remarks (Locked)' : 'Remarks (optional)'}
            rows={2}
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 transition outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </td>
        <td className="px-4 py-4 text-right align-top">
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges || isLocked}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40"
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              Save
            </button>
            {successMsg && (
              <span className="animate-fade-in text-[11px] font-semibold text-emerald-600">
                {successMsg}
              </span>
            )}
          </div>
        </td>
      </tr>
      {errorMsg && (
        <tr className="bg-red-50/40">
          <td colSpan={7} className="text-red-650 border-t-0 px-4 py-2 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 text-red-700">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
              {errorMsg}
            </span>
          </td>
        </tr>
      )}
    </>
  );
};

/* ── MAIN PAGE ── */
export const Rollout = () => {
  const { user } = useAuth();
  const isCoordinator = useMemo(() => {
    const roleName = (user?.role_id?.name || '').toLowerCase();
    return (
      roleName === 'porgram_unit_coordinator' ||
      roleName === 'program_unit_coordinator' ||
      roleName === 'coordinator' ||
      roleName === 'pc'
    );
  }, [user]);

  const org = user?.member_id?.organization || user?.orgn_id;
  const orgId = org?._id;

  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE'>('LIST');
  const [openId, setOpenId] = useState<string | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [rollouts, setRollouts] = useState<RolloutCampaign[]>([]);
  const [coordRollouts, setCoordRollouts] = useState<CoordinatorRollout[]>([]);
  const [templatesCount, setTemplatesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchRolloutsAndTemplates = async () => {
    setLoading(true);
    try {
      if (isCoordinator) {
        if (orgId) {
          const cData = await rolloutService.getCoordinatorRollouts(orgId);
          setCoordRollouts(cData);
        }
      } else {
        const [rData, tData] = await Promise.all([
          rolloutService.getRollouts(),
          rolloutService.getMasterTemplates(),
        ]);
        setRollouts(rData);
        setTemplatesCount(tData.length > 0 ? 1 : 0);
      }
    } catch (err) {
      console.error('Failed to load rollouts/templates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolloutsAndTemplates();
  }, [isCoordinator, orgId]);

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

  const allCoordinatorTasks = useMemo(() => {
    if (!isCoordinator) return [];
    const list: Array<
      RolloutTask & { campaignTitle: string; campaignId: string; rolloutId: string }
    > = [];
    coordRollouts.forEach((cr) => {
      cr.tasks.forEach((t) => {
        list.push({
          ...t,
          campaignTitle: cr.campaign_id?.title || 'Unknown Campaign',
          campaignId: cr.campaign_id?._id,
          rolloutId: cr._id,
        });
      });
    });
    return list;
  }, [coordRollouts, isCoordinator]);

  const filteredCoordTasks = useMemo(() => {
    if (!isCoordinator) return [];
    if (!q) return allCoordinatorTasks;
    return allCoordinatorTasks.filter(
      (t) =>
        t.task_name.toLowerCase().includes(q) ||
        t.task_desc.toLowerCase().includes(q) ||
        t.task_status.toLowerCase().includes(q) ||
        t.campaignTitle.toLowerCase().includes(q),
    );
  }, [q, allCoordinatorTasks, isCoordinator]);

  const handleTemplateSave = () => {
    fetchRolloutsAndTemplates();
    setShowTemplate(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6 rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isCoordinator ? 'My Assigned Rollouts' : 'Rollout Management'}
            </h1>
            <p className="mt-0.5 text-[13px] text-gray-500">
              {isCoordinator
                ? 'Track, update, and manage your program unit rollout tasks'
                : 'Manage and track NSS rollouts across states and districts'}
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

            {!isCoordinator && (
              <>
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
                  onClick={() => setActiveTab('CREATE')}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Rollout</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        {!isCoordinator && (
          <div className="flex gap-6 border-b border-gray-200 px-6 pb-0.5">
            <button
              className={`relative pb-3 text-sm font-bold transition-all duration-205 ${
                activeTab === 'LIST' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              onClick={() => setActiveTab('LIST')}
            >
              Rollout Campaigns
              {activeTab === 'LIST' && (
                <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-indigo-600" />
              )}
            </button>
            <button
              className={`relative pb-3 text-sm font-bold transition-all duration-205 ${
                activeTab === 'CREATE' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              onClick={() => setActiveTab('CREATE')}
            >
              Create Rollout
              {activeTab === 'CREATE' && (
                <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-indigo-600" />
              )}
            </button>
          </div>
        )}

        {/* Stats strip */}
        {(isCoordinator || activeTab === 'LIST') && (
          <div className="flex flex-wrap gap-3 border-t border-gray-100 px-6 py-4">
            <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5">
              <p className="text-[10px] font-semibold tracking-wide text-indigo-400 uppercase">
                {isCoordinator ? 'Assigned campaigns' : 'Total Rollouts'}
              </p>
              <p className="ml-1 text-[14px] font-bold text-indigo-700">
                {isCoordinator ? coordRollouts.length : rollouts.length}
              </p>
            </div>
            {isCoordinator ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5">
                <p className="text-[10px] font-semibold tracking-wide text-emerald-400 uppercase">
                  Completed Tasks
                </p>
                <p className="ml-1 text-[14px] font-bold text-emerald-700">
                  {coordRollouts.reduce(
                    (sum, r) => sum + r.tasks.filter((t) => t.task_status === 'Complete').length,
                    0,
                  )}
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
      </div>

      {/* Create Rollout page embedded or normal view */}
      {!isCoordinator && activeTab === 'CREATE' ? (
        <CreateRollout
          isEmbedded={true}
          onSuccess={() => {
            fetchRolloutsAndTemplates();
            setActiveTab('LIST');
          }}
          onCancel={() => setActiveTab('LIST')}
        />
      ) : /* Rollout list */
      loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : isCoordinator ? (
        filteredCoordTasks.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white py-16 text-center shadow-sm">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-9 w-9 text-gray-300" />
              <div className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-400 ring-2 ring-white">
                <X className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-gray-800">No tasks assigned</p>
              <p className="mt-1 text-[13px] text-gray-400">
                {searchQuery ? (
                  <>
                    No results for{' '}
                    <span className="font-semibold text-gray-600">"{searchQuery}"</span>
                  </>
                ) : (
                  'There are no rollout tasks assigned to your program unit.'
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                    <th className="px-4 py-3">Task Details</th>
                    <th className="w-24 px-4 py-3">Priority</th>
                    <th className="w-48 px-4 py-3">Planned Dates</th>
                    <th className="w-40 px-4 py-3">Actual Dates</th>
                    <th className="w-32 px-4 py-3">Status</th>
                    <th className="w-56 px-4 py-3">Remarks</th>
                    <th className="w-24 px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCoordTasks.map((task) => (
                    <CoordinatorTaskRow
                      key={task.task_id}
                      task={task}
                      orgId={orgId || ''}
                      onSaveSuccess={fetchRolloutsAndTemplates}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
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
              onUpdateSuccess={fetchRolloutsAndTemplates}
            />
          ))}
        </div>
      )}

      <TemplateModal
        isOpen={showTemplate}
        onClose={() => setShowTemplate(false)}
        onSubmit={handleTemplateSave}
      />
    </div>
  );
};

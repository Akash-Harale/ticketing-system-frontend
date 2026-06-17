import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Send,
  Loader2,
  MapPin,
  Building2,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { locationService, State, District } from '@/services/location.service';
import { organizationService, Organization } from '@/services/organization.service';
import { rolloutService } from '@/services/rollout.service';

/* ── Helpers to get state/district name ── */
const getStateName = (org: Organization): string => {
  if (!org.orgn_state) return '';
  return typeof org.orgn_state === 'object' ? org.orgn_state.state_name : '';
};

const getDistrictName = (org: Organization): string => {
  if (!org.orgn_district) return '';
  return typeof org.orgn_district === 'object' ? org.orgn_district.district_name : '';
};

/* ── Multi-select chip component ── */
interface ChipSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}

const ChipSelect = ({
  label,
  options,
  selected,
  onChange,
  placeholder,
  disabled,
}: ChipSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggle = (v: string) => {
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  };
  const allSelected = options.length > 0 && selected.length === options.length;
  const toggleAll = () => onChange(allSelected ? [] : [...options]);

  return (
    <div ref={ref} className="relative mb-4">
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-100 py-0.5 pr-1.5 pl-2.5 text-[12px] font-medium text-indigo-700"
            >
              {v}
              <button
                type="button"
                onClick={() => toggle(v)}
                className="rounded-full p-0.5 transition hover:bg-indigo-200"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm transition ${
          disabled
            ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
            : open
              ? 'border-indigo-400 bg-white ring-2 ring-indigo-100'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
        }`}
      >
        <span className={selected.length > 0 ? 'font-medium text-indigo-600' : 'text-gray-400'}>
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Options panel */}
      {open && (
        <div className="absolute right-0 left-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
          {/* Select all */}
          <button
            type="button"
            onClick={toggleAll}
            className="flex w-full items-center gap-2.5 border-b border-gray-100 px-3.5 py-2.5 text-[12px] font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            <div
              className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition ${allSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}
            >
              {allSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
            </div>
            Select All
          </button>

          {options.map((opt) => {
            const sel = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition hover:bg-indigo-50 ${sel ? 'bg-indigo-50/50 font-medium text-indigo-700' : 'text-gray-700'}`}
              >
                <div
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition ${sel ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}
                >
                  {sel && <CheckCircle2 className="h-3 w-3 text-white" />}
                </div>
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── Unit type helpers ── */
const unitTypeBadge = (role: string) => {
  if (role === 'PU') return 'bg-indigo-100 text-indigo-700';
  return 'bg-emerald-100 text-emerald-700';
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const AddRolloutModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const [dbStates, setDbStates] = useState<State[]>([]);
  const [allDistricts, setAllDistricts] = useState<District[]>([]);
  const [allOrgs, setAllOrgs] = useState<Organization[]>([]);

  useEffect(() => {
    if (isOpen) {
      locationService
        .getStates()
        .then(setDbStates)
        .catch(() => {});
      organizationService
        .getAll()
        .then((res) => {
          const pus = (res.data || []).filter((o) => o.orgn_type === 'PU');
          setAllOrgs(pus);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedStates.length === 0) {
      setAllDistricts([]);
      return;
    }
    const selectedStateIds = selectedStates
      .map((name) => dbStates.find((s) => s.state_name === name)?._id)
      .filter(Boolean) as string[];

    Promise.all(selectedStateIds.map((id) => locationService.getDistrictsByState(id)))
      .then((results) => {
        setAllDistricts(results.flat());
      })
      .catch(() => {});
  }, [selectedStates, dbStates]);

  const stateOptions = useMemo(() => dbStates.map((s) => s.state_name).sort(), [dbStates]);

  const districtOptions = useMemo(() => {
    return [...new Set(allDistricts.map((d) => d.district_name))].sort();
  }, [allDistricts]);

  const units = useMemo(() => {
    if (selectedDistricts.length === 0) return [];
    return allOrgs
      .filter((org) => {
        const stateName = getStateName(org);
        const districtName = getDistrictName(org);
        return selectedStates.includes(stateName) && selectedDistricts.includes(districtName);
      })
      .map((org) => ({
        id: org._id,
        name: org.orgn_name,
        unitName: org.orgn_id,
        role: org.orgn_type,
        district: getDistrictName(org),
        avatarInitials: org.orgn_name.slice(0, 2).toUpperCase(),
        avatarColor: 'from-blue-500 to-indigo-500',
      }));
  }, [selectedStates, selectedDistricts, allOrgs]);

  interface RolloutConfigTask {
    task_id: string;
    task_name: string;
    task_desc: string;
    task_priority: 'High' | 'Medium' | 'Low';
    planned_start_date: string;
    planned_end_date: string;
  }

  const [step, setStep] = useState(1);
  const [tasks, setTasks] = useState<RolloutConfigTask[]>([]);

  const handleStateChange = (states: string[]) => {
    setSelectedStates(states);
    // drop districts that no longer belong to selected states
    const validDistricts = [...new Set(allDistricts.map((d) => d.district_name))];
    setSelectedDistricts((prev) => prev.filter((d) => validDistricts.includes(d)));
  };

  const handleNextStep = async () => {
    if (!title.trim() || selectedStates.length === 0 || selectedDistricts.length === 0) return;
    setLoading(true);
    try {
      const masterTasks = await rolloutService.getMasterTemplates();
      setTasks(
        masterTasks.map((t, idx) => ({
          task_id: (idx + 1).toString(),
          task_name: t.task_name,
          task_desc: t.task_desc || '',
          task_priority: t.priority || 'Low',
          planned_start_date: '',
          planned_end_date: '',
        })),
      );
      setStep(2);
    } catch (err) {
      console.error('Failed to load master template tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedStates.length === 0 || selectedDistricts.length === 0) return;
    setLoading(true);
    try {
      await rolloutService.createRollout({
        title: title.trim(),
        states: selectedStates,
        districts: selectedDistricts,
        tasks: tasks.map((t) => ({
          task_id: t.task_id,
          task_name: t.task_name,
          task_desc: t.task_desc || undefined,
          task_priority: t.task_priority,
          planned_start_date: t.planned_start_date
            ? new Date(t.planned_start_date).toISOString()
            : null,
          planned_end_date: t.planned_end_date ? new Date(t.planned_end_date).toISOString() : null,
        })),
      });
      onSubmit();
      reset();
    } catch (err) {
      console.error('Failed to broadcast rollout', err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedStates([]);
    setSelectedDistricts([]);
    setTitle('');
    setTasks([]);
    setStep(1);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const updateTaskPriority = (index: number, priority: 'High' | 'Medium' | 'Low') => {
    setTasks((prev) =>
      prev.map((t, idx) => (idx === index ? { ...t, task_priority: priority } : t)),
    );
  };

  const updateTaskDate = (
    index: number,
    field: 'planned_start_date' | 'planned_end_date',
    val: string,
  ) => {
    setTasks((prev) => prev.map((t, idx) => (idx === index ? { ...t, [field]: val } : t)));
  };

  const updateTaskDesc = (index: number, val: string) => {
    setTasks((prev) => prev.map((t, idx) => (idx === index ? { ...t, task_desc: val } : t)));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div
        className={`relative z-10 max-h-[90vh] w-full ${step === 2 ? 'max-w-4xl' : 'max-w-lg'} overflow-y-auto rounded-2xl bg-white shadow-2xl transition-all duration-300`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <Send className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">
                {step === 2 ? 'Configure Rollout Tasks' : 'Create Rollout'}
              </h2>
              <p className="text-[12px] text-gray-500">
                {step === 2
                  ? 'Set priorities and planned dates for the rollout tasks'
                  : 'Select states, districts &amp; preview units'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          {step === 1 ? (
            <>
              {/* Rollout title */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Rollout Title *
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Rollout - 5"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none hover:border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* States multi-select */}
              <ChipSelect
                label="Select States *"
                options={stateOptions}
                selected={selectedStates}
                onChange={handleStateChange}
                placeholder="Choose states…"
              />

              {/* Districts multi-select (cascades from states) */}
              <ChipSelect
                label="Select Districts *"
                options={districtOptions}
                selected={selectedDistricts}
                onChange={setSelectedDistricts}
                placeholder={
                  selectedStates.length === 0 ? 'Select states first' : 'Choose districts…'
                }
                disabled={selectedStates.length === 0}
              />

              {/* Program units preview */}
              {selectedDistricts.length > 0 && (
                <div className="mb-4">
                  <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                      <Building2 className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-[11px] font-semibold tracking-widest text-gray-500 uppercase">
                      Program Units
                    </p>
                    <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                      {units.length}
                    </span>
                  </div>

                  {units.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 py-8 text-center">
                      <Building2 className="h-7 w-7 text-gray-300" />
                      <p className="text-sm text-gray-400">
                        No program units in the selected districts.
                      </p>
                    </div>
                  ) : (
                    <div className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
                      {units.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
                        >
                          {/* Avatar */}
                          <div
                            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${u.avatarColor} text-[12px] font-bold text-white shadow-sm`}
                          >
                            {u.avatarInitials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">{u.name}</p>
                            <p className="truncate text-[11px] text-emerald-600">{u.unitName}</p>
                          </div>
                          <div className="hidden flex-col items-end gap-1 sm:flex">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${unitTypeBadge(u.role)}`}
                            >
                              {u.role}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-gray-400">
                              <MapPin className="h-2.5 w-2.5" />
                              {u.district}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="mb-2 text-xs text-gray-500">
                The tasks below are loaded from the Master Template. Changes to priority or dates
                here will only apply to this rollout.
              </p>
              <div className="border-gray-150 overflow-x-auto rounded-xl border">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-gray-150 border-b bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                      <th className="px-4 py-3">Task Details</th>
                      <th className="w-32 px-4 py-3">Priority</th>
                      <th className="w-44 px-4 py-3">Planned Dates</th>
                      <th className="w-36 px-4 py-3">Actual Dates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tasks.map((task, i) => (
                      <tr key={i} className="text-sm hover:bg-gray-50/50">
                        <td className="px-4 py-4 align-top">
                          <p className="mb-1 font-semibold text-gray-800">{task.task_name}</p>
                          <input
                            type="text"
                            value={task.task_desc || ''}
                            onChange={(e) => updateTaskDesc(i, e.target.value)}
                            placeholder="Add task description..."
                            className="text-gray-650 w-full rounded-lg border border-gray-200 px-2.5 py-1 text-xs transition outline-none hover:border-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                          />
                        </td>
                        <td className="px-4 py-4 align-top">
                          <select
                            value={task.task_priority}
                            onChange={(e) =>
                              updateTaskPriority(i, e.target.value as 'High' | 'Medium' | 'Low')
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </td>
                        <td className="space-y-2 px-4 py-4 align-top">
                          <div className="flex flex-col">
                            <label className="mb-1 text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={task.planned_start_date}
                              onChange={(e) =>
                                updateTaskDate(i, 'planned_start_date', e.target.value)
                              }
                              className="w-full rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 transition outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="mb-1 text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={task.planned_end_date}
                              onChange={(e) =>
                                updateTaskDate(i, 'planned_end_date', e.target.value)
                              }
                              className="w-full rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 transition outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top text-xs text-gray-400 italic">
                          Not started yet
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={step === 2 ? () => setStep(1) : handleClose}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              {step === 2 ? 'Back' : 'Cancel'}
            </button>
            {step === 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={
                  loading ||
                  selectedStates.length === 0 ||
                  selectedDistricts.length === 0 ||
                  !title.trim()
                }
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? 'Loading…' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? 'Creating…' : 'Create Rollout'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

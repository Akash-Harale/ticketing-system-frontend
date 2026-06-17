import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Send,
  Loader2,
  MapPin,
  Building2,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Search,
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

export const ChipSelect = ({
  label,
  options,
  selected,
  onChange,
  placeholder,
  disabled,
}: ChipSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  const toggle = (v: string) => {
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  };

  const filteredOptions = useMemo(() => {
    return options.filter((opt) => opt.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm]);

  const allSelected =
    filteredOptions.length > 0 && filteredOptions.every((opt) => selected.includes(opt));

  const toggleAll = () => {
    if (allSelected) {
      onChange(selected.filter((x) => !filteredOptions.includes(x)));
    } else {
      onChange([...new Set([...selected, ...filteredOptions])]);
    }
  };

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
        <div className="absolute right-0 left-0 z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
          {/* Search Input */}
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white p-2">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
              <Search className="h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search options..."
                className="w-full bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none"
              />
            </div>
          </div>

          {/* Select all */}
          {filteredOptions.length > 0 && (
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
              Select All ({filteredOptions.length})
            </button>
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
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
            })
          ) : (
            <div className="py-4 text-center text-xs text-gray-400 italic">
              No options match your search.
            </div>
          )}
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

interface RolloutConfigTask {
  task_id: string;
  task_name: string;
  task_desc: string;
  task_priority: 'High' | 'Medium' | 'Low';
  planned_start_date: string;
  planned_end_date: string;
}

export const CreateRollout = ({
  onSuccess,
  onCancel,
  isEmbedded = false,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
  isEmbedded?: boolean;
}) => {
  const navigate = useNavigate();
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const [dbStates, setDbStates] = useState<State[]>([]);
  const [allDistricts, setAllDistricts] = useState<District[]>([]);
  const [allOrgs, setAllOrgs] = useState<Organization[]>([]);

  const [step, setStep] = useState(1);
  const [tasks, setTasks] = useState<RolloutConfigTask[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
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
  }, []);

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

  const handleStateChange = (states: string[]) => {
    setSelectedStates(states);
    const validDistricts = [...new Set(allDistricts.map((d) => d.district_name))];
    setSelectedDistricts((prev) => prev.filter((d) => validDistricts.includes(d)));
  };

  const handleNextStep = async () => {
    if (
      !title.trim() ||
      selectedStates.length === 0 ||
      selectedDistricts.length === 0 ||
      !startDate ||
      !endDate
    )
      return;
    if (new Date(endDate) < new Date(startDate)) {
      setErrorMsg('End Date cannot be earlier than Start Date.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
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
    if (
      !title.trim() ||
      selectedStates.length === 0 ||
      selectedDistricts.length === 0 ||
      !startDate ||
      !endDate
    )
      return;

    const campaignStart = new Date(startDate);
    const campaignEnd = new Date(endDate);

    if (campaignEnd < campaignStart) {
      setErrorMsg('End Date cannot be earlier than Start Date.');
      return;
    }

    // Validate that planned start and end dates are specified and valid
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      if (!t.planned_start_date) {
        setErrorMsg(`Planned start date is required for task "${t.task_name}".`);
        return;
      }
      if (!t.planned_end_date) {
        setErrorMsg(`Planned end date is required for task "${t.task_name}".`);
        return;
      }
      const start = new Date(t.planned_start_date);
      const end = new Date(t.planned_end_date);
      if (end < start) {
        setErrorMsg(
          `For task "${t.task_name}", Planned End Date cannot be earlier than Planned Start Date.`,
        );
        return;
      }
      if (start < campaignStart) {
        setErrorMsg(
          `For task "${t.task_name}", Planned Start Date must be on or after the rollout start date.`,
        );
        return;
      }
      if (end > campaignEnd) {
        setErrorMsg(
          `For task "${t.task_name}", Planned End Date must be on or before the rollout end date.`,
        );
        return;
      }
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await rolloutService.createRollout({
        title: title.trim(),
        states: selectedStates,
        districts: selectedDistricts,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        tasks: tasks.map((t) => ({
          task_id: t.task_id,
          task_name: t.task_name,
          task_desc: t.task_desc || undefined,
          task_priority: t.task_priority,
          planned_start_date: new Date(t.planned_start_date).toISOString(),
          planned_end_date: new Date(t.planned_end_date).toISOString(),
        })),
      });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/rollout');
      }
    } catch (err: unknown) {
      let msg = 'Failed to broadcast rollout campaign. Please try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          msg = axiosError.response.data.message;
        }
      }
      setErrorMsg(msg);
      console.error('Failed to broadcast rollout', err);
    } finally {
      setLoading(false);
    }
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

  const formContent = (
    <div
      className={`mx-auto w-full ${step === 2 ? 'max-w-6xl' : 'max-w-2xl'} transition-all duration-300`}
    >
      {/* Card Box */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="shadow-indigo-150 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {step === 2 ? 'Configure Rollout Tasks' : 'New Rollout Campaign'}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {step === 2
                  ? 'Set task priorities and planned start/end dates for this campaign'
                  : 'Specify the campaign title, state/district scopes and preview target units'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onCancel) onCancel();
              else navigate('/rollout');
            }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6">
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-800">
              <X className="h-4 w-4 flex-shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}
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
                  placeholder="e.g. Rollout Campaign - Phase 1"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none hover:border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Start Date and End Date */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none hover:border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm transition outline-none hover:border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
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
                      Program Units Preview
                    </p>
                    <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                      {units.length}
                    </span>
                  </div>

                  {units.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 py-8 text-center">
                      <Building2 className="h-7 w-7 text-gray-300" />
                      <p className="text-sm text-gray-400">
                        No program units found in selected districts.
                      </p>
                    </div>
                  ) : (
                    <div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
                      {units.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
                        >
                          <div
                            key={u.id}
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
                Configure priorities and planned dates for the tasks below. These changes apply
                strictly to this rollout.
              </p>
              <div className="border-gray-150 overflow-x-auto rounded-xl border">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-gray-150 border-b bg-gray-50 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                      <th className="px-4 py-3">Task Details</th>
                      <th className="w-32 px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Planned Dates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tasks.map((task, i) => (
                      <tr key={i} className="text-sm hover:bg-gray-50/50">
                        <td className="px-4 py-4 align-middle">
                          <p className="mb-1 font-semibold text-gray-800">{task.task_name}</p>
                          <input
                            type="text"
                            value={task.task_desc || ''}
                            onChange={(e) => updateTaskDesc(i, e.target.value)}
                            placeholder="Add task description..."
                            className="text-gray-650 w-full rounded-lg border border-gray-200 px-2.5 py-1 text-xs transition outline-none hover:border-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                          />
                        </td>
                        <td className="px-4 py-4 align-middle">
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
                        <td className="px-4 py-4 align-middle">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                                Start:
                              </span>
                              <input
                                type="date"
                                value={task.planned_start_date}
                                onChange={(e) =>
                                  updateTaskDate(i, 'planned_start_date', e.target.value)
                                }
                                className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 transition outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                                End:
                              </span>
                              <input
                                type="date"
                                value={task.planned_end_date}
                                onChange={(e) =>
                                  updateTaskDate(i, 'planned_end_date', e.target.value)
                                }
                                className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 transition outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={
                step === 2
                  ? () => setStep(1)
                  : () => {
                      if (onCancel) onCancel();
                      else navigate('/rollout');
                    }
              }
              className="text-gray-650 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50"
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
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? 'Loading…' : 'Configure Tasks'}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? 'Creating…' : 'Create Campaign'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  if (isEmbedded) {
    return formContent;
  }

  return <div className="min-h-screen bg-gray-50 py-6">{formContent}</div>;
};

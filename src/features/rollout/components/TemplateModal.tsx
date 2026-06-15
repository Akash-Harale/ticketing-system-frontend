import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, GripVertical, Loader2, FileText, ChevronDown } from 'lucide-react';
import { rolloutService } from '@/services/rollout.service';

export type Priority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  text: string;
  description: string;
  priority: Priority;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, tasks: Task[]) => void;
}

const uid = () => Math.random().toString(36).slice(2);

const PRIORITY_STYLES: Record<Priority, string> = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const EMPTY_TASK = (): Task => ({ id: uid(), text: '', description: '', priority: 'Medium' });

const PrioritySelect = ({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (p: Priority) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition hover:opacity-80 ${PRIORITY_STYLES[value]}`}
      >
        {value}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 w-28 rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
          {(['High', 'Medium', 'Low'] as Priority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                onChange(p);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-[12px] font-semibold hover:bg-gray-50 ${value === p ? 'opacity-100' : 'opacity-60'}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${p === 'High' ? 'bg-red-500' : p === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}
              />
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const TemplateModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [name, setName] = useState('');
  const [tasks, setTasks] = useState<Task[]>([EMPTY_TASK()]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [nameErr, setNameErr] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const dragIdx = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      rolloutService
        .getMasterTemplates()
        .then((data) => {
          if (data && data.length > 0) {
            setTasks(
              data.map((t) => ({
                id: t._id || t.task_id,
                text: t.task_name,
                description: t.task_desc || '',
                priority: t.priority,
              })),
            );
          } else {
            setTasks([EMPTY_TASK()]);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch templates', err);
          setTasks([EMPTY_TASK()]);
        })
        .finally(() => {
          setLoading(false);
        });
      setName('Master Template');
      setDeletedIds([]);
    }
  }, [isOpen]);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });

  const addTask = () => {
    const t = EMPTY_TASK();
    setTasks((ts) => [...ts, t]);
  };

  const removeTask = (id: string) => {
    // If it's a mongo ID, track it for deletion on save
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      setDeletedIds((prev) => [...prev, id]);
    }
    setTasks((ts) => ts.filter((x) => x.id !== id));
  };

  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((ts) => ts.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const onDragStart = (i: number) => {
    dragIdx.current = i;
  };
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    const next = [...tasks];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(i, 0, moved);
    dragIdx.current = i;
    setTasks(next);
  };
  const onDragEnd = () => {
    dragIdx.current = null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameErr('Template name is required');
      return;
    }
    const filled = tasks.filter((t) => t.text.trim());
    if (filled.length === 0) return;

    setLoading(true);
    try {
      // 1. Delete tasks removed by user
      for (const id of deletedIds) {
        await rolloutService.deleteMasterTemplate(id);
      }
      setDeletedIds([]);

      // 2. Create or Update tasks
      const updatedTasks: Task[] = [];
      for (let i = 0; i < filled.length; i++) {
        const t = filled[i];
        const payload = {
          task_id: `MT${String(i + 1).padStart(3, '0')}`,
          task_name: t.text,
          task_desc: t.description || '',
          priority: t.priority,
        };

        const isMongoId = /^[0-9a-fA-F]{24}$/.test(t.id);
        if (isMongoId) {
          const res = await rolloutService.updateMasterTemplate(t.id, payload);
          updatedTasks.push({
            id: res._id || res.task_id,
            text: res.task_name,
            description: res.task_desc || '',
            priority: res.priority,
          });
        } else {
          const res = await rolloutService.createMasterTemplate(payload);
          updatedTasks.push({
            id: res._id || res.task_id,
            text: res.task_name,
            description: res.task_desc || '',
            priority: res.priority,
          });
        }
      }

      onSubmit(name.trim(), updatedTasks);
      setName('');
      setTasks([EMPTY_TASK()]);
      setNameErr('');
      setExpanded(new Set());
    } catch (err) {
      console.error('Failed to save template tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setTasks([EMPTY_TASK()]);
    setNameErr('');
    setExpanded(new Set());
    setDeletedIds([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">Create Template</h2>
              <p className="text-[12px] text-gray-500">
                Add tasks · set priority · drag to reorder
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
          {/* Template name */}
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Template Name *
            </label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameErr('');
              }}
              placeholder="e.g. Annual NSS Camp Template"
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${nameErr ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
            />
            {nameErr && <p className="mt-1 text-xs text-red-500">{nameErr}</p>}
          </div>

          {/* Tasks header */}
          <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <FileText className="h-3.5 w-3.5" />
            </span>
            <p className="text-[11px] font-semibold tracking-widest text-gray-500 uppercase">
              Tasks
            </p>
            <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
              {tasks.length}
            </span>
          </div>

          {/* Task list */}
          <div className="flex flex-col gap-3">
            {tasks.map((task, i) => {
              const isExp = expanded.has(task.id);
              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={(e) => onDragOver(e, i)}
                  onDragEnd={onDragEnd}
                  className={`overflow-hidden rounded-xl border transition-all duration-300 ${isExp ? 'border-indigo-200 bg-indigo-50/40 shadow-sm shadow-indigo-100' : 'border-gray-200 bg-white hover:border-gray-300'} cursor-grab active:cursor-grabbing`}
                >
                  {/* Task header row */}
                  <div className="flex w-full items-center gap-3 px-4 py-3.5">
                    {/* Drag handle */}
                    <GripVertical className="h-4 w-4 flex-shrink-0 text-gray-300 transition hover:text-indigo-400" />

                    {/* FAQ-style number badge */}
                    <span
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${isExp ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {i + 1}
                    </span>

                    {/* Task name input */}
                    <input
                      value={task.text}
                      onChange={(e) => updateTask(task.id, { text: e.target.value })}
                      placeholder={`Task ${i + 1} name…`}
                      className={`flex-1 bg-transparent text-sm font-semibold placeholder-gray-400 outline-none ${isExp ? 'text-indigo-700' : 'text-gray-800'}`}
                    />

                    {/* Priority pill */}
                    <PrioritySelect
                      value={task.priority}
                      onChange={(p) => updateTask(task.id, { priority: p })}
                    />

                    {/* Expand toggle */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(task.id)}
                      className="flex-shrink-0 rounded-full p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 ${isExp ? 'rotate-180 text-indigo-500' : ''}`}
                      />
                    </button>

                    {/* Remove */}
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTask(task.id)}
                        className="flex-shrink-0 rounded-full p-0.5 text-gray-300 transition hover:bg-red-50 hover:text-red-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Expanded: description */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isExp ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="border-t border-indigo-100 px-5 py-3 pl-[3.75rem]">
                      <textarea
                        value={task.description}
                        onChange={(e) => updateTask(task.id, { description: e.target.value })}
                        rows={2}
                        placeholder="Optional: add a description for this task…"
                        className="w-full resize-none bg-transparent text-sm leading-relaxed text-gray-600 placeholder-gray-400 outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add task */}
          <button
            type="button"
            onClick={addTask}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-200 py-2.5 text-sm font-medium text-indigo-500 transition hover:border-indigo-400 hover:bg-indigo-50"
          >
            <Plus className="h-4 w-4" /> Add Task
          </button>

          {/* Actions */}
          <div className="mt-5 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? 'Saving…' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, ChevronDown, Loader2 } from 'lucide-react';
import { STATES, getDistricts } from '../data/programUnitData';

export interface AddProgramUnitFormData {
  state: string;
  district: string;
  programUnitName: string;
  coordinatorName: string;
  coordinatorPhone: string;
  coordinatorEmail: string;
}

interface AddProgramUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddProgramUnitFormData) => void;
}

interface SelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  error?: string;
}

const FormSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  error,
}: SelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div ref={ref} className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm transition-all duration-150 ${
            disabled
              ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
              : open
                ? 'border-indigo-400 bg-white ring-2 ring-indigo-100'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          } ${error ? 'border-red-400' : ''}`}
        >
          <span className={value ? 'text-gray-800' : 'text-gray-400'}>{value || placeholder}</span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="absolute top-full left-0 z-50 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                id={`${id}-opt-${opt.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3.5 py-2 text-left text-sm transition-colors hover:bg-indigo-50 hover:text-indigo-700 ${
                  value === opt ? 'bg-indigo-50 font-medium text-indigo-600' : 'text-gray-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormInput = ({ label, error, id, ...props }: FormInputProps) => (
  <div className="mb-4">
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-800 transition-all duration-150 outline-none placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
        error ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
      }`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const EMPTY_FORM: AddProgramUnitFormData = {
  state: '',
  district: '',
  programUnitName: '',
  coordinatorName: '',
  coordinatorPhone: '',
  coordinatorEmail: '',
};

export const AddProgramUnitModal = ({ isOpen, onClose, onSubmit }: AddProgramUnitModalProps) => {
  const [form, setForm] = useState<AddProgramUnitFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<AddProgramUnitFormData>>({});
  const [loading, setLoading] = useState(false);

  const districts = form.state ? getDistricts(form.state) : [];

  const setField = (field: keyof AddProgramUnitFormData) => (value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'state' ? { district: '' } : {}),
    }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Partial<AddProgramUnitFormData> = {};
    if (!form.state) errs.state = 'State is required';
    if (!form.district) errs.district = 'District is required';
    if (!form.programUnitName.trim()) errs.programUnitName = 'Program unit name is required';
    if (!form.coordinatorName.trim()) errs.coordinatorName = 'Coordinator name is required';
    if (!form.coordinatorPhone.trim()) errs.coordinatorPhone = 'Phone number is required';
    if (!form.coordinatorEmail.trim()) errs.coordinatorEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.coordinatorEmail))
      errs.coordinatorEmail = 'Invalid email address';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate API
    onSubmit(form);
    setLoading(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 id="modal-title" className="text-[15px] font-semibold text-gray-900">
                Add Program Unit
              </h2>
              <p className="text-[12px] text-gray-500">Register a new NSS program unit</p>
            </div>
          </div>
          <button
            id="modal-close"
            onClick={handleClose}
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          {/* Location Section */}
          <p className="mb-3 text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            Location
          </p>
          <FormSelect
            id="form-state"
            label="State *"
            value={form.state}
            onChange={setField('state')}
            options={STATES}
            placeholder="Select state"
            error={errors.state}
          />
          <FormSelect
            id="form-district"
            label="District *"
            value={form.district}
            onChange={setField('district')}
            options={districts}
            placeholder={form.state ? 'Select district' : 'Select state first'}
            disabled={!form.state}
            error={errors.district}
          />

          {/* Unit Details */}
          <p className="mb-3 text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            Program Unit Details
          </p>
          <FormInput
            id="form-unit-name"
            label="Program Unit Name *"
            placeholder="e.g. NSS Unit - COEP Technological University"
            value={form.programUnitName}
            onChange={(e) => setField('programUnitName')(e.target.value)}
            error={errors.programUnitName}
          />

          {/* Coordinator Details */}
          <p className="mb-3 text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            Coordinator Details
          </p>
          <FormInput
            id="form-coord-name"
            label="Name *"
            placeholder="e.g. Dr. Rajesh Kulkarni"
            value={form.coordinatorName}
            onChange={(e) => setField('coordinatorName')(e.target.value)}
            error={errors.coordinatorName}
          />
          <FormInput
            id="form-coord-phone"
            label="Phone Number *"
            type="tel"
            placeholder="+91 94220 11234"
            value={form.coordinatorPhone}
            onChange={(e) => setField('coordinatorPhone')(e.target.value)}
            error={errors.coordinatorPhone}
          />
          <FormInput
            id="form-coord-email"
            label="Email ID *"
            type="email"
            placeholder="coordinator@college.ac.in"
            value={form.coordinatorEmail}
            onChange={(e) => setField('coordinatorEmail')(e.target.value)}
            error={errors.coordinatorEmail}
          />

          {/* Actions */}
          <div className="mt-2 flex justify-end gap-3">
            <button
              id="form-cancel"
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              id="form-submit"
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? 'Saving…' : 'Add Program Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

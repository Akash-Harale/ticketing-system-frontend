import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, ChevronDown, Loader2, Building2, User } from 'lucide-react';
import { STATES, getDistricts } from '../../programUnit/data/programUnitData';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

export interface AddUserFormData {
  // Unit / Institution details
  college: string;
  state: string;
  district: string;
  address: string;
  unitType: 'College' | 'University' | 'Institution' | '';
  volunteerStrength: string;
  establishedYear: string;
  // Coordinator details
  coordinatorName: string;
  coordinatorDesignation: string;
  coordinatorPhone: string;
  coordinatorEmail: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddUserFormData) => void;
}

/* ─────────────────────────────────────────────
   REUSABLE FIELD COMPONENTS
───────────────────────────────────────────── */

interface FormSelectProps {
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
}: FormSelectProps) => {
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

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const FormTextarea = ({ label, error, id, ...props }: FormTextareaProps) => (
  <div className="mb-4">
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
    </label>
    <textarea
      id={id}
      rows={2}
      className={`w-full resize-none rounded-lg border px-3.5 py-2.5 text-sm text-gray-800 transition-all duration-150 outline-none placeholder:text-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
        error ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
      }`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

/* ─────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────── */

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="mb-4 flex items-center gap-2.5 border-b border-gray-100 pb-3">
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
      {icon}
    </span>
    <p className="text-[11px] font-semibold tracking-widest text-gray-500 uppercase">{title}</p>
  </div>
);

/* ─────────────────────────────────────────────
   UNIT TYPE OPTIONS
───────────────────────────────────────────── */

const UNIT_TYPES = ['College', 'University', 'Institution'];

/* ─────────────────────────────────────────────
   EMPTY FORM
───────────────────────────────────────────── */

const EMPTY: AddUserFormData = {
  college: '',
  state: '',
  district: '',
  address: '',
  unitType: '',
  volunteerStrength: '',
  establishedYear: '',
  coordinatorName: '',
  coordinatorDesignation: '',
  coordinatorPhone: '',
  coordinatorEmail: '',
};

/* ─────────────────────────────────────────────
   MODAL
───────────────────────────────────────────── */

export const AddUserModal = ({ isOpen, onClose, onSubmit }: AddUserModalProps) => {
  const [form, setForm] = useState<AddUserFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof AddUserFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const districts = form.state ? getDistricts(form.state) : [];

  const setField = (field: keyof AddUserFormData) => (value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'state' ? { district: '' } : {}),
    }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof AddUserFormData, string>> = {};
    if (!form.college.trim()) errs.college = 'College / Institution name is required';
    if (!form.state) errs.state = 'State is required';
    if (!form.district) errs.district = 'District is required';
    if (!form.address.trim()) errs.address = 'Full address is required';
    if (!form.unitType) errs.unitType = 'Unit type is required';
    if (!form.volunteerStrength.trim()) errs.volunteerStrength = 'Volunteer strength is required';
    else if (isNaN(Number(form.volunteerStrength)) || Number(form.volunteerStrength) <= 0)
      errs.volunteerStrength = 'Enter a valid number';
    if (!form.establishedYear.trim()) errs.establishedYear = 'Established year is required';
    else if (
      isNaN(Number(form.establishedYear)) ||
      Number(form.establishedYear) < 1900 ||
      Number(form.establishedYear) > new Date().getFullYear()
    )
      errs.establishedYear = 'Enter a valid year';
    if (!form.coordinatorName.trim()) errs.coordinatorName = 'Coordinator name is required';
    if (!form.coordinatorDesignation.trim())
      errs.coordinatorDesignation = 'Designation is required';
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
    await new Promise((r) => setTimeout(r, 800));
    onSubmit(form);
    setLoading(false);
    setForm(EMPTY);
    setErrors({});
  };

  const handleClose = () => {
    setForm(EMPTY);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-user-modal-title"
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
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 id="add-user-modal-title" className="text-[15px] font-semibold text-gray-900">
                Add User
              </h2>
              <p className="text-[12px] text-gray-500">Register a new NSS program unit user</p>
            </div>
          </div>
          <button
            id="add-user-modal-close"
            onClick={handleClose}
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5">
          {/* ── Unit / Institution Details ── */}
          <SectionHeader
            icon={<Building2 className="h-3.5 w-3.5" />}
            title="College / Institution Details"
          />

          <FormInput
            id="add-user-college"
            label="College / Institution *"
            placeholder="e.g. COEP Technological University"
            value={form.college}
            onChange={(e) => setField('college')(e.target.value)}
            error={errors.college}
          />

          {/* State + District side by side */}
          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              id="add-user-state"
              label="State *"
              value={form.state}
              onChange={setField('state')}
              options={STATES}
              placeholder="Select state"
              error={errors.state}
            />
            <FormSelect
              id="add-user-district"
              label="District *"
              value={form.district}
              onChange={setField('district')}
              options={districts}
              placeholder={form.state ? 'Select district' : 'Select state first'}
              disabled={!form.state}
              error={errors.district}
            />
          </div>

          <FormTextarea
            id="add-user-address"
            label="Full Address *"
            placeholder="e.g. Wellesley Road, Shivajinagar, Pune, Maharashtra 411005"
            value={form.address}
            onChange={(e) => setField('address')(e.target.value)}
            error={errors.address}
          />

          <FormSelect
            id="add-user-unit-type"
            label="Unit Type *"
            value={form.unitType}
            onChange={setField('unitType')}
            options={UNIT_TYPES}
            placeholder="Select unit type"
            error={errors.unitType}
          />

          {/* Strength + Year side by side */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="add-user-strength"
              label="Volunteer Strength *"
              type="number"
              min="1"
              placeholder="e.g. 120"
              value={form.volunteerStrength}
              onChange={(e) => setField('volunteerStrength')(e.target.value)}
              error={errors.volunteerStrength}
            />
            <FormInput
              id="add-user-year"
              label="Established Year *"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              placeholder="e.g. 1972"
              value={form.establishedYear}
              onChange={(e) => setField('establishedYear')(e.target.value)}
              error={errors.establishedYear}
            />
          </div>

          {/* ── Coordinator Details ── */}
          <div className="mt-2">
            <SectionHeader icon={<User className="h-3.5 w-3.5" />} title="Coordinator Details" />
          </div>

          <FormInput
            id="add-user-coord-name"
            label="Full Name *"
            placeholder="e.g. Dr. Rajesh Kulkarni"
            value={form.coordinatorName}
            onChange={(e) => setField('coordinatorName')(e.target.value)}
            error={errors.coordinatorName}
          />

          <FormInput
            id="add-user-coord-designation"
            label="Designation *"
            placeholder="e.g. Programme Officer"
            value={form.coordinatorDesignation}
            onChange={(e) => setField('coordinatorDesignation')(e.target.value)}
            error={errors.coordinatorDesignation}
          />

          {/* Phone + Email side by side */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="add-user-coord-phone"
              label="Phone Number *"
              type="tel"
              placeholder="+91 94220 11234"
              value={form.coordinatorPhone}
              onChange={(e) => setField('coordinatorPhone')(e.target.value)}
              error={errors.coordinatorPhone}
            />
            <FormInput
              id="add-user-coord-email"
              label="Email ID *"
              type="email"
              placeholder="coordinator@college.ac.in"
              value={form.coordinatorEmail}
              onChange={(e) => setField('coordinatorEmail')(e.target.value)}
              error={errors.coordinatorEmail}
            />
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              id="add-user-cancel"
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              id="add-user-submit"
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? 'Saving…' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

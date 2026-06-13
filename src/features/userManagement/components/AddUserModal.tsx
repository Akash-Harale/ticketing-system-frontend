import React, { useState, useEffect } from 'react';
import { X, Plus, ChevronDown, Loader2, Building2, User } from 'lucide-react';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

export interface AddUserFormData {
  organization: string;
  name: string;
  email: string;
  mobile: string;
  role_id: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddUserFormData) => void;
}

interface FormSelectObjectProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  disabled?: boolean;
  error?: string;
}

const FormSelectObject = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  error,
}: FormSelectObjectProps) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-lg border px-3.5 py-2.5 text-sm transition-all duration-150 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
            disabled
              ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
              : error
                ? 'border-red-400 bg-white text-gray-800'
                : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
   EMPTY FORM
───────────────────────────────────────────── */

const EMPTY: AddUserFormData = {
  organization: '',
  name: '',
  email: '',
  mobile: '',
  role_id: '',
};

/* ─────────────────────────────────────────────
   MODAL
───────────────────────────────────────────── */
import { api } from '@/api/axios';
import { Organization } from '@/services/organization.service';

export const AddUserModal = ({ isOpen, onClose, onSubmit }: AddUserModalProps) => {
  const [form, setForm] = useState<AddUserFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof AddUserFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const [orgs, setOrgs] = useState<{ label: string; value: string }[]>([]);
  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch organizations
      api
        .get('/organizations')
        .then((res) => {
          if (res.data.success) {
            setOrgs(
              res.data.data.map((o: Organization) => ({
                label: `${o.orgn_name} (${o.orgn_type})`,
                value: o._id,
              })),
            );
          }
        })
        .catch(console.error);

      // Fetch roles
      api
        .get('/rbac/roles')
        .then((res) => {
          if (res.data?.status === 'success' || res.data?.success) {
            const filteredRoles = res.data.data.roles.filter(
              (r: { name: string }) => r.name.toLowerCase() !== 'superadmin',
            );
            setRoles(
              filteredRoles.map((r: { name: string; _id: string }) => ({
                label: r.name,
                value: r._id,
              })),
            );
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const setField = (field: keyof AddUserFormData) => (value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof AddUserFormData, string>> = {};
    if (!form.organization) errs.organization = 'Organization is required';
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.mobile.trim()) errs.mobile = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(form.mobile)) errs.mobile = 'Invalid mobile number';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.role_id) errs.role_id = 'Role is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await onSubmit(form);
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
          {/* ── Organization Selection ── */}
          <SectionHeader
            icon={<Building2 className="h-3.5 w-3.5" />}
            title="Organization / Program Unit"
          />

          <FormSelectObject
            id="add-user-organization"
            label="Organization *"
            value={form.organization}
            onChange={setField('organization')}
            options={orgs}
            placeholder="Select an organization"
            error={errors.organization}
          />

          {/* ── User Details (Only shown if org selected) ── */}
          {form.organization && (
            <div className="animate-in fade-in slide-in-from-top-2 mt-4">
              <SectionHeader icon={<User className="h-3.5 w-3.5" />} title="User Details" />

              <FormInput
                id="add-user-name"
                label="Full Name *"
                placeholder="e.g. Dr. Rajesh Kulkarni"
                value={form.name}
                onChange={(e) => setField('name')(e.target.value)}
                error={errors.name}
              />

              {/* Phone + Email side by side */}
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  id="add-user-mobile"
                  label="Mobile Number *"
                  type="tel"
                  placeholder="9422011234"
                  value={form.mobile}
                  onChange={(e) => setField('mobile')(e.target.value)}
                  error={errors.mobile}
                />
                <FormInput
                  id="add-user-email"
                  label="Email ID *"
                  type="email"
                  placeholder="user@college.ac.in"
                  value={form.email}
                  onChange={(e) => setField('email')(e.target.value)}
                  error={errors.email}
                />
              </div>

              <FormSelectObject
                id="add-user-role"
                label="Role *"
                value={form.role_id}
                onChange={setField('role_id')}
                options={roles}
                placeholder="Select a role"
                error={errors.role_id}
              />
            </div>
          )}

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

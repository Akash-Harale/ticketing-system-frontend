import React, { useState, useEffect } from 'react';
import { X, Building2, Loader2 } from 'lucide-react';
import { Organization } from '@/services/organization.service';
import { locationService, State, District } from '@/services/location.service';

export interface EditProgramUnitFormData {
  orgn_id: string;
  orgn_name: string;
  orgn_address1: string;
  orgn_address2: string;
  orgn_place: string;
  orgn_state: string;
  orgn_district: string;
  orgn_pincode: string;
}

interface EditProgramUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Organization | null;
  onSubmit: (id: string, data: EditProgramUnitFormData) => void;
}

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

export const EditProgramUnitModal = ({
  isOpen,
  onClose,
  unit,
  onSubmit,
}: EditProgramUnitModalProps) => {
  const [form, setForm] = useState<EditProgramUnitFormData>({
    orgn_id: '',
    orgn_name: '',
    orgn_address1: '',
    orgn_address2: '',
    orgn_place: '',
    orgn_state: '',
    orgn_district: '',
    orgn_pincode: '',
  });
  const [errors, setErrors] = useState<Partial<EditProgramUnitFormData>>({});
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    locationService
      .getStates()
      .then(setStates)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (unit && isOpen) {
      const stateId = typeof unit.orgn_state === 'object' ? unit.orgn_state?._id : unit.orgn_state;
      const districtId =
        typeof unit.orgn_district === 'object' ? unit.orgn_district?._id : unit.orgn_district;

      setForm({
        orgn_id: unit.orgn_id || '',
        orgn_name: unit.orgn_name || '',
        orgn_address1: unit.orgn_address1 || '',
        orgn_address2: unit.orgn_address2 || '',
        orgn_place: unit.orgn_place || '',
        orgn_state: stateId || '',
        orgn_district: districtId || '',
        orgn_pincode: unit.orgn_pincode || '',
      });
      setErrors({});
    }
  }, [unit, isOpen]);

  useEffect(() => {
    setDistricts([]);
    if (!form.orgn_state) return;
    setLoadingDistricts(true);
    locationService
      .getDistrictsByState(form.orgn_state)
      .then(setDistricts)
      .catch(() => {})
      .finally(() => setLoadingDistricts(false));
  }, [form.orgn_state]);

  const setField = (field: keyof EditProgramUnitFormData) => (value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'orgn_state' ? { orgn_district: '' } : {}),
    }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Partial<EditProgramUnitFormData> = {};
    if (!form.orgn_id?.trim()) errs.orgn_id = 'Unit ID is required';
    if (!form.orgn_name?.trim()) errs.orgn_name = 'Program unit name is required';
    if (!form.orgn_state) errs.orgn_state = 'State is required';
    if (!form.orgn_pincode?.trim()) errs.orgn_pincode = 'Pincode is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !unit) return;

    setLoading(true);
    await onSubmit(unit._id, form);
    setLoading(false);
  };

  if (!isOpen || !unit) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">Edit Program Unit</h2>
              <p className="text-[12px] text-gray-500">{unit.orgn_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto">
          <div className="px-6 py-5">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                id="edit-unit-id"
                label="Unit ID *"
                value={form.orgn_id}
                onChange={(e) => setField('orgn_id')(e.target.value)}
                error={errors.orgn_id}
              />
              <FormInput
                id="edit-unit-name"
                label="Unit Name *"
                value={form.orgn_name}
                onChange={(e) => setField('orgn_name')(e.target.value)}
                error={errors.orgn_name}
              />
            </div>
            <FormInput
              id="edit-unit-addr1"
              label="Address Line 1"
              value={form.orgn_address1}
              onChange={(e) => setField('orgn_address1')(e.target.value)}
              error={errors.orgn_address1}
            />
            <FormInput
              id="edit-unit-addr2"
              label="Address Line 2"
              value={form.orgn_address2}
              onChange={(e) => setField('orgn_address2')(e.target.value)}
              error={errors.orgn_address2}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                id="edit-unit-place"
                label="Place / City"
                value={form.orgn_place}
                onChange={(e) => setField('orgn_place')(e.target.value)}
              />
              <FormInput
                id="edit-unit-pin"
                label="Pincode *"
                value={form.orgn_pincode}
                onChange={(e) => setField('orgn_pincode')(e.target.value)}
                error={errors.orgn_pincode}
              />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">State *</label>
                <select
                  value={form.orgn_state}
                  onChange={(e) => setField('orgn_state')(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                    errors.orgn_state ? 'border-red-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select state…</option>
                  {states.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.state_name}
                    </option>
                  ))}
                </select>
                {errors.orgn_state && (
                  <p className="mt-1 text-xs text-red-500">{errors.orgn_state}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">District</label>
                <select
                  value={form.orgn_district}
                  onChange={(e) => setField('orgn_district')(e.target.value)}
                  disabled={!form.orgn_state || loadingDistricts}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 ${
                    errors.orgn_district ? 'border-red-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">{loadingDistricts ? 'Loading…' : 'Select district…'}</option>
                  {districts.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.district_name}
                    </option>
                  ))}
                </select>
                {errors.orgn_district && (
                  <p className="mt-1 text-xs text-red-500">{errors.orgn_district}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-gray-50/60 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

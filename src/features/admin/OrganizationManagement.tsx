import React, { useState, useEffect } from 'react';
import { Building2, Plus } from 'lucide-react';
import { locationService, type State, type District } from '@/services/location.service';
import {
  organizationService,
  type Organization,
  type CreateOrganizationPayload,
} from '@/services/organization.service';
import { type NotifyFn } from './types';
import { Section, getErrMsg } from './shared';
import { usePermission } from '@/context/auth/usePermission';

interface Props {
  notify: NotifyFn;
}

const EMPTY_ORG: Partial<CreateOrganizationPayload> = {
  orgn_id: '',
  orgn_type: 'PU',
  orgn_name: '',
  orgn_address1: '',
  orgn_address2: '',
  orgn_place: '',
  orgn_state: '',
  orgn_district: '',
  orgn_pincode: '',
};

export function OrganizationManagement({ notify }: Props) {
  const { hasPermission } = usePermission();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [newOrg, setNewOrg] = useState<Partial<CreateOrganizationPayload>>(EMPTY_ORG);
  const [loading, setLoading] = useState(true);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchOrganizations = async () => {
    try {
      const res = await organizationService.getAll();
      if (res.success) setOrganizations(res.data);
    } catch {
      notify('Failed to load organizations.', 'error');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [statesData] = await Promise.all([locationService.getStates(), fetchOrganizations()]);
        setStates(statesData);
      } catch {
        notify('Failed to load initial data.', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (newOrg.orgn_state) {
      locationService
        .getDistrictsByState(newOrg.orgn_state)
        .then(setDistricts)
        .catch(() => notify('Failed to load districts.', 'error'));
    } else {
      setDistricts([]);
    }
  }, [newOrg.orgn_state]);

  // ── Handler ───────────────────────────────────────────────────────────────
  async function handleCreateOrganization(e: React.FormEvent) {
    e.preventDefault();
    if (
      !newOrg.orgn_id ||
      !newOrg.orgn_type ||
      !newOrg.orgn_name ||
      !newOrg.orgn_state ||
      !newOrg.orgn_pincode
    ) {
      notify('Please fill required organization fields.', 'error');
      return;
    }
    try {
      await organizationService.create(newOrg as CreateOrganizationPayload);
      setNewOrg(EMPTY_ORG);
      notify('Organization created successfully.');
      fetchOrganizations();
    } catch (err) {
      notify(getErrMsg(err, 'Failed to create organization.'), 'error');
    }
  }

  const inputCls =
    'w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm placeholder-gray-400 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10';
  const labelCls = 'text-[10px] font-bold tracking-wider text-gray-400 uppercase';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="text-indigo-655 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 ring-4 ring-indigo-50/30">
            <Building2 className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Organization Management</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Create and manage organizational units, NSS, PMU, and others.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Section title="Organizations" icon={Building2}>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Create form */}
            {hasPermission('Program_Unit', 'CREATE') && (
              <form onSubmit={handleCreateOrganization} className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800">Create New Organization</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelCls}>Organization ID *</label>
                    <input
                      required
                      placeholder="e.g. ORG-001"
                      value={newOrg.orgn_id}
                      onChange={(e) => setNewOrg({ ...newOrg, orgn_id: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Org Type *</label>
                    <select
                      required
                      value={newOrg.orgn_type}
                      onChange={(e) =>
                        setNewOrg({
                          ...newOrg,
                          orgn_type: e.target.value as CreateOrganizationPayload['orgn_type'],
                        })
                      }
                      className={inputCls}
                    >
                      <option value="PU">Program Unit (PU)</option>
                      <option value="NSS">NSS</option>
                      <option value="PMU">PMU</option>
                      <option value="OTH">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Organization Name *</label>
                  <input
                    required
                    placeholder="e.g. Pune University NSS"
                    value={newOrg.orgn_name}
                    onChange={(e) => setNewOrg({ ...newOrg, orgn_name: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelCls}>State *</label>
                    <select
                      required
                      value={newOrg.orgn_state}
                      onChange={(e) =>
                        setNewOrg({ ...newOrg, orgn_state: e.target.value, orgn_district: '' })
                      }
                      className={inputCls}
                    >
                      <option value="">Select State</option>
                      {states.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.state_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>District</label>
                    <select
                      value={newOrg.orgn_district}
                      onChange={(e) => setNewOrg({ ...newOrg, orgn_district: e.target.value })}
                      className={`${inputCls} disabled:opacity-50`}
                      disabled={!newOrg.orgn_state}
                    >
                      <option value="">Select District</option>
                      {districts.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.district_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelCls}>Address 1</label>
                    <input
                      placeholder="Street / Building"
                      value={newOrg.orgn_address1}
                      onChange={(e) => setNewOrg({ ...newOrg, orgn_address1: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Address 2</label>
                    <input
                      placeholder="Area / Locality"
                      value={newOrg.orgn_address2}
                      onChange={(e) => setNewOrg({ ...newOrg, orgn_address2: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelCls}>City / Place</label>
                    <input
                      placeholder="City"
                      value={newOrg.orgn_place}
                      onChange={(e) => setNewOrg({ ...newOrg, orgn_place: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Pincode *</label>
                    <input
                      required
                      placeholder="6 digits"
                      pattern="[0-9]{6}"
                      title="Pincode must be 6 digits"
                      value={newOrg.orgn_pincode}
                      onChange={(e) => setNewOrg({ ...newOrg, orgn_pincode: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="hover:shadow-indigo-150 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" /> Create Organization
                </button>
              </form>
            )}

            {/* Existing organizations list */}
            <div className="flex flex-col">
              <h4 className="mb-3 text-sm font-bold text-gray-800">
                Existing Organizations ({organizations.length})
              </h4>
              {loading ? (
                <p className="text-xs text-gray-400 italic">Loading…</p>
              ) : (
                <div className="max-h-[500px] space-y-2.5 overflow-y-auto pr-1">
                  {organizations.map((org) => (
                    <div
                      key={org._id}
                      className="flex flex-col gap-1.5 rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:border-indigo-200 hover:shadow"
                    >
                      <div className="flex items-center justify-between">
                        <span className="leading-none font-bold text-gray-900">
                          {org.orgn_name}
                        </span>
                        <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                          {org.orgn_type}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-gray-400">ID: {org.orgn_id}</div>
                    </div>
                  ))}
                  {organizations.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No organizations found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

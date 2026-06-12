import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Building2, MapPin, User, Mail, Phone,
  ChevronRight, ChevronDown, X, AlertCircle, CheckCircle2, Loader2, Calendar
} from 'lucide-react';
import { organizationService, Organization, CreateOrganizationPayload, Member } from '@/services/organization.service';
import { locationService, State, District } from '@/services/location.service';

// ── Constants ─────────────────────────────────────────────────────────────────
const TABS = ['Program Unit Details', 'Coordinator Details'] as const;
type Tab = (typeof TABS)[number];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStateName = (org: Organization): string => {
  if (!org.orgn_state) return '—';
  return typeof org.orgn_state === 'object' ? org.orgn_state.state_name : '—';
};

const getStateId = (org: Organization): string => {
  if (!org.orgn_state) return '';
  return typeof org.orgn_state === 'object' ? org.orgn_state._id : org.orgn_state;
};

const getDistrictName = (org: Organization): string => {
  if (!org.orgn_district) return '—';
  return typeof org.orgn_district === 'object' ? org.orgn_district.district_name : '—';
};

const getDistrictId = (org: Organization): string => {
  if (!org.orgn_district) return '';
  return typeof org.orgn_district === 'object' ? org.orgn_district._id : org.orgn_district;
};

// ── Empty Form State ──────────────────────────────────────────────────────────
interface FormState {
  orgn_id: string;
  orgn_name: string;
  orgn_address1: string;
  orgn_address2: string;
  orgn_place: string;
  orgn_state: string;
  orgn_district: string;
  orgn_pincode: string;
  coordinator_name: string;
  coordinator_email: string;
  coordinator_mobile: string;
}

const emptyForm = (): FormState => ({
  orgn_id: '',
  orgn_name: '',
  orgn_address1: '',
  orgn_address2: '',
  orgn_place: '',
  orgn_state: '',
  orgn_district: '',
  orgn_pincode: '',
  coordinator_name: '',
  coordinator_email: '',
  coordinator_mobile: '',
});

// ── Validation ────────────────────────────────────────────────────────────────
type FormErrors = Partial<Record<keyof FormState, string>>;

const validateTab1 = (form: FormState): FormErrors => {
  const errors: FormErrors = {};
  if (!form.orgn_id.trim()) errors.orgn_id = 'Unit ID is required.';
  if (!form.orgn_name.trim()) errors.orgn_name = 'Unit name is required.';
  if (!form.orgn_state) errors.orgn_state = 'State is required.';
  if (!/^\d{6}$/.test(form.orgn_pincode)) errors.orgn_pincode = 'Enter a valid 6-digit pincode.';
  return errors;
};

const validateTab2 = (form: FormState): FormErrors => {
  const errors: FormErrors = {};
  if (!form.coordinator_name.trim()) errors.coordinator_name = 'Coordinator name is required.';
  if (!form.coordinator_email.trim()) {
    errors.coordinator_email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.coordinator_email)) {
    errors.coordinator_email = 'Enter a valid email address.';
  }
  if (!form.coordinator_mobile.trim()) {
    errors.coordinator_mobile = 'Mobile number is required.';
  } else if (!/^[0-9]{10}$/.test(form.coordinator_mobile)) {
    errors.coordinator_mobile = 'Enter a valid 10-digit mobile number.';
  }
  return errors;
};

// ── Main Page Component ───────────────────────────────────────────────────────

export const ProgramUnit = () => {
  // List state
  const [units, setUnits] = useState<Organization[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');
  const [search, setSearch] = useState('');

  // Location dropdowns (for the Create modal)
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Accordion & Filter state
  const [expandedStateId, setExpandedStateId] = useState<string | null>(null);
  const [expandedStateDistricts, setExpandedStateDistricts] = useState<District[]>([]);
  const [districtFilter, setDistrictFilter] = useState<string>(''); // district ID

  // Drawer state
  const [selectedUnit, setSelectedUnit] = useState<Organization | null>(null);
  const [selectedCoordinator, setSelectedCoordinator] = useState<Member | null>(null);
  const [loadingCoordinator, setLoadingCoordinator] = useState(false);
  const [drawerTab, setDrawerTab] = useState<Tab>(TABS[0]);

  // Modal / form state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // ── Fetch program units ───────────────────────────────────────────────────
  const fetchUnits = useCallback(async () => {
    setLoadingList(true);
    setListError('');
    try {
      const res = await organizationService.getAll();
      const pu = (res.data as Organization[]).filter((o) => o.orgn_type === 'PU');
      setUnits(pu);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to load program units.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  // ── Fetch states on mount ─────────────────────────────────────────────────
  useEffect(() => {
    locationService.getStates().then(setStates).catch(() => {});
  }, []);

  // ── Fetch districts when state changes in Form ────────────────────────────
  useEffect(() => {
    setForm((prev) => ({ ...prev, orgn_district: '' }));
    setDistricts([]);
    if (!form.orgn_state) return;
    setLoadingDistricts(true);
    locationService
      .getDistrictsByState(form.orgn_state)
      .then(setDistricts)
      .catch(() => {})
      .finally(() => setLoadingDistricts(false));
  }, [form.orgn_state]);

  // ── Fetch districts when Accordion opens ──────────────────────────────────
  useEffect(() => {
    if (expandedStateId) {
      locationService
        .getDistrictsByState(expandedStateId)
        .then(setExpandedStateDistricts)
        .catch(() => {});
    } else {
      setExpandedStateDistricts([]);
    }
    setDistrictFilter('');
  }, [expandedStateId]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openModal = () => {
    setForm(emptyForm());
    setErrors({});
    setSubmitSuccess('');
    setSubmitError('');
    setActiveTab(TABS[0]);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleNextTab = () => {
    const tab1Errors = validateTab1(form);
    if (Object.keys(tab1Errors).length > 0) {
      setErrors(tab1Errors);
      return;
    }
    setErrors({});
    setActiveTab(TABS[1]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const tab2Errors = validateTab2(form);
    if (Object.keys(tab2Errors).length > 0) {
      setErrors(tab2Errors);
      return;
    }

    const payload: CreateOrganizationPayload = {
      orgn_id: form.orgn_id.trim(),
      orgn_type: 'PU',
      orgn_name: form.orgn_name.trim(),
      orgn_address1: form.orgn_address1.trim() || undefined,
      orgn_address2: form.orgn_address2.trim() || undefined,
      orgn_place: form.orgn_place.trim() || undefined,
      orgn_state: form.orgn_state,
      orgn_district: form.orgn_district || undefined,
      orgn_pincode: form.orgn_pincode,
      coordinator: {
        name: form.coordinator_name.trim(),
        email: form.coordinator_email.trim().toLowerCase(),
        mobile: form.coordinator_mobile.trim(),
      },
    };

    try {
      setSubmitting(true);
      await organizationService.create(payload);
      setSubmitSuccess(`Program Unit "${form.orgn_name}" created successfully!`);
      await fetchUnits();
      setTimeout(() => {
        closeModal();
        setSubmitSuccess('');
      }, 1800);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Drawer Handlers ───────────────────────────────────────────────────────
  const openUnitDetails = async (unit: Organization) => {
    setSelectedUnit(unit);
    setDrawerTab(TABS[0]);
    setSelectedCoordinator(null);
    setLoadingCoordinator(true);
    try {
      const coordinator = await organizationService.getCoordinatorByOrg(unit._id);
      setSelectedCoordinator(coordinator);
    } catch (err) {
      console.error('Failed to fetch coordinator details', err);
    } finally {
      setLoadingCoordinator(false);
    }
  };

  const closeDrawer = () => {
    setSelectedUnit(null);
  };

  // ── Derived Data ──────────────────────────────────────────────────────────
  const filteredUnits = units.filter(
    (u) =>
      u.orgn_name.toLowerCase().includes(search.toLowerCase()) ||
      u.orgn_id.toLowerCase().includes(search.toLowerCase()) ||
      getStateName(u).toLowerCase().includes(search.toLowerCase()),
  );

  const unitsByState = filteredUnits.reduce((acc, unit) => {
    const stateId = getStateId(unit);
    if (!stateId) return acc;
    if (!acc[stateId]) acc[stateId] = [];
    acc[stateId].push(unit);
    return acc;
  }, {} as Record<string, Organization[]>);

  const statesWithUnits = Object.keys(unitsByState).map((stateId) => {
    const unit = unitsByState[stateId][0];
    return {
      id: stateId,
      name: getStateName(unit),
      units: unitsByState[stateId],
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen text-gray-900">
      
      {/* ── Left Drawer ───────────────────────────────────────────────────── */}
      {/* Overlay */}
      {selectedUnit && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          onClick={closeDrawer}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-[420px] max-w-full bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          selectedUnit ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Program Unit Details</h2>
          <button
            onClick={closeDrawer}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Drawer Tabs */}
        <div className="flex border-b border-gray-200 bg-white px-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setDrawerTab(tab)}
              className={`flex-1 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                drawerTab === tab
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
          {selectedUnit && (
            <div className="flex flex-col gap-6">
              {/* Unit Info Section */}
              {drawerTab === TABS[0] && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
                  <div className="mb-5 flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{selectedUnit.orgn_name}</h3>
                      <p className="mt-1 text-sm font-semibold text-indigo-600">{selectedUnit.orgn_id}</p>
                    </div>
                    <span className="rounded-full bg-indigo-100 px-3 py-1.5 text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
                      PU
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <div className="text-gray-700 leading-relaxed">
                        {[selectedUnit.orgn_address1, selectedUnit.orgn_address2]
                          .filter(Boolean)
                          .map((line, i) => <p key={i}>{line}</p>)}
                        <p>
                          {[selectedUnit.orgn_place, getDistrictName(selectedUnit)].filter(Boolean).join(', ')}
                        </p>
                        <p className="font-medium text-gray-900 mt-1">
                          {getStateName(selectedUnit)} {selectedUnit.orgn_pincode ? `- ${selectedUnit.orgn_pincode}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 pt-3 border-t border-gray-200">
                      <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                      <p>Created on {new Date(selectedUnit.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Coordinator Info Section */}
              {drawerTab === TABS[1] && (
                <div>
                  {loadingCoordinator ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-10 text-sm text-gray-500">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                      Loading coordinator details...
                    </div>
                  ) : selectedCoordinator ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                      <div className="mb-5 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg">
                          {selectedCoordinator.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">{selectedCoordinator.name}</p>
                          <p className="text-xs text-green-600 font-medium flex items-center gap-1.5 mt-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Active Coordinator
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex flex-col gap-4 text-sm bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 text-gray-700">
                          <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                          <a href={`mailto:${selectedCoordinator.email}`} className="text-indigo-600 font-medium hover:underline">
                            {selectedCoordinator.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                          {selectedCoordinator.mobile ? (
                            <a href={`tel:${selectedCoordinator.mobile}`} className="font-medium hover:text-indigo-600 transition-colors">
                              {selectedCoordinator.mobile}
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">No mobile provided</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                      <User className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-sm font-medium text-gray-600">No coordinator assigned</p>
                      <p className="text-xs text-gray-400 mt-1">This program unit doesn't have a coordinator yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Program Units</h1>
            <p className="mt-0.5 text-sm text-gray-400">
              Manage NSS Program Units and their coordinators
            </p>
          </div>
          <button
            id="btn-add-program-unit"
            onClick={openModal}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 active:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Program Unit
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="input-search-units"
            type="search"
            placeholder="Search by name, ID or state…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* ── Main Content (Accordions) ─────────────────────────────────────── */}
      <div className="p-6">
        {loadingList ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : listError ? (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {listError}
          </div>
        ) : statesWithUnits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Building2 className="mb-3 h-10 w-10 text-gray-400" />
            <p className="text-sm font-medium text-gray-500">
              {search ? 'No units match your search.' : 'No program units yet.'}
            </p>
            {!search && (
              <button
                onClick={openModal}
                className="mt-3 text-sm text-indigo-600 hover:underline"
              >
                Add your first program unit →
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {statesWithUnits.map((state) => {
              const isExpanded = expandedStateId === state.id;
              
              // Apply district filter
              const stateUnits = state.units.filter((u) => {
                if (!districtFilter) return true;
                return getDistrictId(u) === districtFilter;
              });

              return (
                <div key={state.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  {/* Accordion Header */}
                  <button
                    onClick={() => {
                      if (isExpanded) {
                        setExpandedStateId(null);
                      } else {
                        setExpandedStateId(state.id);
                      }
                    }}
                    className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                        {state.name.charAt(0)}
                      </span>
                      <div className="text-left">
                        <span className="block text-base font-semibold text-gray-900">{state.name}</span>
                        <span className="block text-xs text-gray-500">{state.units.length} Unit(s)</span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-600' : ''}`}
                    />
                  </button>

                  {/* Accordion Content */}
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}
                  >
                    <div className="border-t border-gray-100 bg-gray-50/50 p-6">
                      
                      {/* District Filter */}
                      <div className="mb-6 flex items-center justify-end">
                        <div className="flex items-center gap-2">
                          <label htmlFor={`filter-${state.id}`} className="text-sm font-medium text-gray-600">Filter by District:</label>
                          <select
                            id={`filter-${state.id}`}
                            value={districtFilter}
                            onChange={(e) => setDistrictFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">All Districts</option>
                            {expandedStateDistricts.map(d => (
                              <option key={d._id} value={d._id}>{d.district_name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Units Grid */}
                      {stateUnits.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-500 border border-dashed border-gray-300 rounded-xl bg-white">
                          No units found in this district.
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {stateUnits.map((unit) => (
                            <div
                              key={unit._id}
                              onClick={() => openUnitDetails(unit)}
                              className="group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-100/50"
                            >
                              <span className="absolute right-4 top-4 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                                PU
                              </span>
                              <div>
                                <p className="pr-10 text-[14px] font-bold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors">
                                  {unit.orgn_name}
                                </p>
                                <p className="mt-0.5 text-xs font-medium text-gray-500">{unit.orgn_id}</p>
                              </div>
                              <div className="flex flex-col gap-1.5 text-xs text-gray-500 mt-1">
                                {(unit.orgn_place || getDistrictName(unit) !== '—') && (
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                    {[unit.orgn_place, getDistrictName(unit)].filter(Boolean).join(', ')}
                                  </span>
                                )}
                              </div>
                              <div className="mt-auto pt-2 flex items-center justify-end text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
                                <span className="text-xs font-medium">View details</span>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          id="modal-add-program-unit"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="flex w-full max-w-lg flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Add Program Unit</h2>
                <p className="text-xs text-gray-500">
                  Fill in both tabs, then submit.
                </p>
              </div>
              <button
                id="btn-close-modal"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-gray-200">
              {TABS.map((tab, idx) => (
                <button
                  key={tab}
                  id={`tab-${idx}`}
                  onClick={() => {
                    if (idx === 1) {
                      const e = validateTab1(form);
                      if (Object.keys(e).length > 0) { setErrors(e); return; }
                    }
                    setErrors({});
                    setActiveTab(tab);
                  }}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-indigo-600 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span
                    className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                      activeTab === tab
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  {tab}
                </button>
              ))}
            </div>

            {/* Success / Error banners */}
            {submitSuccess && (
              <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {submitSuccess}
              </div>
            )}
            {submitError && (
              <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {submitError}
              </div>
            )}

            {/* Form Body */}
            <form id="form-add-program-unit" onSubmit={handleSubmit} noValidate>
              <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: '60vh' }}>
                {/* ── TAB 1: Program Unit Details ─────────────────────────── */}
                {activeTab === TABS[0] && (
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        id="input-orgn-id"
                        label="Unit ID *"
                        name="orgn_id"
                        placeholder="e.g. PU-MH-001"
                        value={form.orgn_id}
                        onChange={handleChange}
                        error={errors.orgn_id}
                      />
                      <Field
                        id="input-orgn-name"
                        label="Unit Name *"
                        name="orgn_name"
                        placeholder="e.g. NSS Unit Pune"
                        value={form.orgn_name}
                        onChange={handleChange}
                        error={errors.orgn_name}
                      />
                    </div>

                    <Field
                      id="input-orgn-address1"
                      label="Address Line 1"
                      name="orgn_address1"
                      placeholder="Street / Building"
                      value={form.orgn_address1}
                      onChange={handleChange}
                    />
                    <Field
                      id="input-orgn-address2"
                      label="Address Line 2"
                      name="orgn_address2"
                      placeholder="Area / Landmark"
                      value={form.orgn_address2}
                      onChange={handleChange}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        id="input-orgn-place"
                        label="Place / City"
                        name="orgn_place"
                        placeholder="e.g. Pune"
                        value={form.orgn_place}
                        onChange={handleChange}
                      />
                      <Field
                        id="input-orgn-pincode"
                        label="Pincode *"
                        name="orgn_pincode"
                        placeholder="6-digit pincode"
                        value={form.orgn_pincode}
                        onChange={handleChange}
                        error={errors.orgn_pincode}
                        maxLength={6}
                        inputMode="numeric"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="select-state" className="mb-1.5 block text-xs font-semibold text-gray-700">
                          State *
                        </label>
                        <select
                          id="select-state"
                          name="orgn_state"
                          value={form.orgn_state}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
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
                        <label htmlFor="select-district" className="mb-1.5 block text-xs font-semibold text-gray-700">
                          District
                        </label>
                        <select
                          id="select-district"
                          name="orgn_district"
                          value={form.orgn_district}
                          onChange={handleChange}
                          disabled={!form.orgn_state || loadingDistricts}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 shadow-sm"
                        >
                          <option value="">
                            {loadingDistricts ? 'Loading…' : 'Select district…'}
                          </option>
                          {districts.map((d) => (
                            <option key={d._id} value={d._id}>
                              {d.district_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: Coordinator Details ──────────────────────────── */}
                {activeTab === TABS[1] && (
                  <div className="flex flex-col gap-5">
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3.5 text-sm text-indigo-800 flex items-start gap-3 shadow-sm">
                      <AlertCircle className="h-5 w-5 shrink-0 text-indigo-500" />
                      <div>
                        <p className="font-bold">Default Login Password</p>
                        <p className="mt-0.5 text-indigo-700/90">
                          The coordinator's account will be created with the default password:{' '}
                          <code className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono font-bold text-indigo-900 ml-1">
                            nutan123
                          </code>
                        </p>
                      </div>
                    </div>

                    <Field
                      id="input-coordinator-name"
                      label="Full Name *"
                      name="coordinator_name"
                      placeholder="e.g. Akash Harale"
                      value={form.coordinator_name}
                      onChange={handleChange}
                      error={errors.coordinator_name}
                      icon={<User className="h-4 w-4 text-gray-400" />}
                    />
                    <Field
                      id="input-coordinator-email"
                      label="Email Address *"
                      name="coordinator_email"
                      type="email"
                      placeholder="e.g. akash@example.com"
                      value={form.coordinator_email}
                      onChange={handleChange}
                      error={errors.coordinator_email}
                      icon={<Mail className="h-4 w-4 text-gray-400" />}
                    />
                    <Field
                      id="input-coordinator-mobile"
                      label="Mobile Number *"
                      name="coordinator_mobile"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={form.coordinator_mobile}
                      onChange={handleChange}
                      error={errors.coordinator_mobile}
                      icon={<Phone className="h-4 w-4 text-gray-400" />}
                      maxLength={10}
                      inputMode="numeric"
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 rounded-b-2xl">
                {activeTab === TABS[0] ? (
                  <>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-next-tab"
                      type="button"
                      onClick={handleNextTab}
                      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 shadow-sm"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveTab(TABS[0])}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                    >
                      <ChevronRight className="h-4 w-4 rotate-180" /> Back
                    </button>
                    <button
                      id="btn-submit-program-unit"
                      type="submit"
                      disabled={submitting}
                      className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-70 shadow-sm"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        'Create Program Unit'
                      )}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Reusable Field Component ──────────────────────────────────────────────────
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  name: string;
  error?: string;
  icon?: React.ReactNode;
}

const Field = ({ id, label, name, error, icon, ...rest }: FieldProps) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-gray-700">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
      )}
      <input
        id={id}
        name={name}
        className={`w-full rounded-lg border bg-white py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-1 shadow-sm ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/30'
        } ${icon ? 'pl-10 pr-3' : 'px-3'}`}
        {...rest}
      />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

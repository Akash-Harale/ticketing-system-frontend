import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Search,
  Building2,
  MapPin,
  User,
  Mail,
  Phone,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  Briefcase,
} from 'lucide-react';
import {
  organizationService,
  Organization,
  CreateOrganizationPayload,
  Member,
} from '@/services/organization.service';
import { locationService, State, District } from '@/services/location.service';
import { StateCard } from '@/features/programUnit/components/StateCard';
import { MultiSelectDropdown, MultiSelectOption } from '@/components/ui/MultiSelectDropdown';
import {
  EditProgramUnitModal,
  EditProgramUnitFormData,
} from '@/features/programUnit/components/EditProgramUnitModal';
import {
  EditUserModal,
  EditUserFormData,
} from '@/features/userManagement/components/EditUserModal';
import { UserItem } from '@/features/userManagement/data/userManagementData';

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

// ── Drawer Information Row ────────────────────────────────────────────────────
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3 border-b border-gray-100 py-3.5 last:border-0">
    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-gray-405 text-[10px] font-bold tracking-wider uppercase">{label}</p>
      <p className="mt-0.5 text-sm leading-snug font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

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

  // State & District selection filters (matching Users.tsx style)
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

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

  const [showEditUnitModal, setShowEditUnitModal] = useState(false);
  const [showEditCoordinatorModal, setShowEditCoordinatorModal] = useState(false);

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
    locationService
      .getStates()
      .then(setStates)
      .catch(() => {});
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
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
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this program unit?')) return;
    try {
      await organizationService.remove(id);
      setSelectedUnit(null);
      await fetchUnits();
    } catch (err) {
      console.error(err);
      alert('Failed to delete program unit.');
    }
  };

  const handleEditUnitSubmit = async (id: string, data: EditProgramUnitFormData) => {
    try {
      const updated = await organizationService.update(id, data);
      setSelectedUnit(updated.data);
      setShowEditUnitModal(false);
      await fetchUnits();
    } catch (err) {
      console.error(err);
      alert('Failed to update program unit.');
    }
  };

  const handleEditCoordinatorSubmit = async (data: EditUserFormData) => {
    if (!selectedCoordinator) return;
    try {
      const { api } = await import('@/api/axios');
      await api.put(`/members/${selectedCoordinator._id}`, data);
      setShowEditCoordinatorModal(false);
      if (selectedUnit) {
        openUnitDetails(selectedUnit);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update coordinator.');
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
  const filteredUnits = useMemo(() => {
    return units.filter(
      (u) =>
        u.orgn_name.toLowerCase().includes(search.toLowerCase()) ||
        u.orgn_id.toLowerCase().includes(search.toLowerCase()) ||
        getStateName(u).toLowerCase().includes(search.toLowerCase()),
    );
  }, [units, search]);

  const unitsByState = useMemo(() => {
    return filteredUnits.reduce(
      (acc, unit) => {
        const stateId = getStateId(unit);
        if (!stateId) return acc;
        if (!acc[stateId]) acc[stateId] = [];
        acc[stateId].push(unit);
        return acc;
      },
      {} as Record<string, Organization[]>,
    );
  }, [filteredUnits]);

  const statesWithUnits = useMemo(() => {
    return Object.keys(unitsByState)
      .map((stateId) => {
        const unit = unitsByState[stateId][0];
        return {
          id: stateId,
          name: getStateName(unit),
          units: unitsByState[stateId],
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [unitsByState]);

  const districtOptions: MultiSelectOption[] = useMemo(() => {
    if (!selectedState) return [];
    const stateObj = statesWithUnits.find((s) => s.id === selectedState);
    if (!stateObj) return [];

    const distMap = new Map<string, string>();
    stateObj.units.forEach((u) => {
      const name = getDistrictName(u);
      const id = getDistrictId(u);
      if (name && name !== '—' && id) {
        distMap.set(name, id);
      }
    });

    return Array.from(distMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, id]) => ({ value: id, label: name }));
  }, [selectedState, statesWithUnits]);

  const displayedUnits = useMemo(() => {
    if (!selectedState || selectedDistricts.length === 0) return [];
    const stateObj = statesWithUnits.find((s) => s.id === selectedState);
    if (!stateObj) return [];
    return stateObj.units.filter((u) => selectedDistricts.includes(getDistrictId(u)));
  }, [selectedState, selectedDistricts, statesWithUnits]);

  const handleStateClick = (stateId: string) => {
    if (selectedState === stateId) {
      setSelectedState(null);
      setSelectedDistricts([]);
    } else {
      setSelectedState(stateId);
      setSelectedDistricts([]);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen text-gray-900">
      {/* ── Left Drawer ───────────────────────────────────────────────────── */}
      {/* Overlay */}
      {selectedUnit && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          selectedUnit ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2
                id="program-unit-drawer-title"
                className="truncate text-[15px] leading-snug font-bold text-gray-900"
              >
                {selectedUnit?.orgn_name}
              </h2>
              <p className="mt-0.5 truncate text-[13px] text-gray-500">{selectedUnit?.orgn_id}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
                <span className="text-indigo-750 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                  PU
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="flex-shrink-0 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Tabs */}
        <div className="flex gap-2 border-b border-gray-100 bg-white px-6 py-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setDrawerTab(tab)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                drawerTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto bg-white px-6 py-4">
          {selectedUnit && (
            <div className="flex flex-col">
              {/* Unit Info Section */}
              {drawerTab === TABS[0] && (
                <div className="flex flex-col">
                  <InfoRow
                    icon={<Building2 className="h-4 w-4" />}
                    label="Unit Name"
                    value={selectedUnit.orgn_name}
                  />
                  <InfoRow
                    icon={<Building2 className="h-4 w-4" />}
                    label="Unit ID"
                    value={selectedUnit.orgn_id}
                  />
                  {(selectedUnit.orgn_address1 || selectedUnit.orgn_address2) && (
                    <InfoRow
                      icon={<MapPin className="h-4 w-4" />}
                      label="Address"
                      value={[selectedUnit.orgn_address1, selectedUnit.orgn_address2]
                        .filter(Boolean)
                        .join(', ')}
                    />
                  )}
                  {selectedUnit.orgn_place && (
                    <InfoRow
                      icon={<MapPin className="h-4 w-4" />}
                      label="Place / City"
                      value={selectedUnit.orgn_place}
                    />
                  )}
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="District"
                    value={getDistrictName(selectedUnit)}
                  />
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="State"
                    value={getStateName(selectedUnit)}
                  />
                  {selectedUnit.orgn_pincode && (
                    <InfoRow
                      icon={<MapPin className="h-4 w-4" />}
                      label="Pincode"
                      value={selectedUnit.orgn_pincode}
                    />
                  )}
                  <InfoRow
                    icon={<Calendar className="h-4 w-4" />}
                    label="Created Date"
                    value={new Date(selectedUnit.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  />
                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-col gap-3">
                    <button
                      onClick={() => setShowEditUnitModal(true)}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Edit Unit Details
                    </button>
                    <button
                      onClick={() => handleDeleteUnit(selectedUnit._id)}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
                    >
                      Delete Unit
                    </button>
                  </div>
                </div>
              )}

              {/* Coordinator Info Section */}
              {drawerTab === TABS[1] && (
                <div>
                  {loadingCoordinator ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-gray-500">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                      Loading coordinator details...
                    </div>
                  ) : selectedCoordinator ? (
                    <div className="flex flex-col">
                      <div className="mb-4 flex items-center gap-4 border-b border-gray-100 pb-4">
                        <div className="to-indigo-650 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 text-base font-bold text-white shadow">
                          {selectedCoordinator.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-950">
                            {selectedCoordinator.name}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Active Coordinator
                          </p>
                        </div>
                      </div>

                      <InfoRow
                        icon={<User className="h-4 w-4" />}
                        label="Full Name"
                        value={selectedCoordinator.name}
                      />
                      <InfoRow
                        icon={<Mail className="h-4 w-4" />}
                        label="Email Address"
                        value={selectedCoordinator.email}
                      />
                      <InfoRow
                        icon={<Phone className="h-4 w-4" />}
                        label="Mobile Number"
                        value={selectedCoordinator.mobile || '—'}
                      />
                      <InfoRow
                        icon={<Building2 className="h-4 w-4" />}
                        label="Assigned Unit"
                        value={selectedUnit.orgn_name}
                      />
                      <InfoRow
                        icon={<Briefcase className="h-4 w-4" />}
                        label="Designation"
                        value={selectedCoordinator.designation || ''}
                      />
                      <InfoRow
                        icon={<User className="h-4 w-4" />}
                        label="Role"
                        value={selectedCoordinator.role_id?.name || ''}
                      />

                      {/* Action Buttons */}
                      <div className="mt-6 flex flex-col gap-3">
                        <div className="flex gap-3">
                          {selectedCoordinator.mobile && (
                            <a
                              href={`tel:${selectedCoordinator.mobile}`}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                            >
                              <Phone className="h-4 w-4" />
                              Call
                            </a>
                          )}
                          <a
                            href={`mailto:${selectedCoordinator.email}`}
                            className="text-indigo-705 flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold transition hover:bg-indigo-100"
                          >
                            <Mail className="h-4 w-4" />
                            Email
                          </a>
                        </div>
                        <button
                          onClick={() => setShowEditCoordinatorModal(true)}
                          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Edit Coordinator Details
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-gray-150 mt-4 rounded-2xl border-2 border-dashed bg-gray-50/50 p-8 text-center">
                      <User className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                      <p className="text-gray-750 text-sm font-bold">No coordinator assigned</p>
                      <p className="text-gray-450 mt-1 text-xs leading-relaxed">
                        This program unit doesn't have an active coordinator assigned yet.
                      </p>
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
            <h1 className="text-xl font-bold text-gray-900">Program Units</h1>
            <p className="mt-0.5 text-sm text-gray-400">
              Manage NSS Program Units and their coordinators
            </p>
          </div>
          <button
            id="btn-add-program-unit"
            onClick={openModal}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-500 active:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Program Unit
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-4 max-w-sm">
          <Search className="text-gray-450 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            id="input-search-units"
            type="search"
            placeholder="Search by name, ID or state…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-gray-250 w-full rounded-xl border bg-white py-2.5 pr-4 pl-9 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="p-6">
        {loadingList ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : listError ? (
          <div className="text-red-650 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {listError}
          </div>
        ) : statesWithUnits.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-24 text-center shadow-sm">
            <Building2 className="text-gray-305 mb-3 h-10 w-10" />
            <p className="text-sm font-semibold text-gray-500">
              {search ? 'No units match your search.' : 'No program units yet.'}
            </p>
            {!search && (
              <button
                onClick={openModal}
                className="text-indigo-650 mt-3 text-sm font-bold hover:underline"
              >
                Add your first program unit →
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {search ? (
              // Search Results mode
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-gray-805 mb-4 text-sm font-bold">
                  Search Results ({filteredUnits.length})
                </h2>
                {filteredUnits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Building2 className="mb-3 h-10 w-10 animate-pulse text-gray-300" />
                    <p className="text-gray-650 text-sm font-semibold">No units match "{search}"</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredUnits.map((unit) => (
                      <div
                        key={unit._id}
                        onClick={() => openUnitDetails(unit)}
                        className="group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-100/50"
                      >
                        <span className="text-indigo-650 absolute top-4 right-4 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                          PU
                        </span>
                        <div>
                          <p className="pr-10 text-[14px] leading-snug font-bold text-gray-900 transition-colors group-hover:text-indigo-600">
                            {unit.orgn_name}
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-gray-500">
                            {unit.orgn_id}
                          </p>
                        </div>
                        <div className="mt-1 flex flex-col gap-1.5 text-xs text-gray-500">
                          {(unit.orgn_place || getDistrictName(unit) !== '—') && (
                            <span className="flex items-center gap-1.5 font-medium">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                              {[unit.orgn_place, getDistrictName(unit)].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </div>
                        <div className="mt-auto flex items-center justify-end pt-2 text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="text-xs font-semibold">View details</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // States List mode (identical interaction to Users.tsx Program Unit Users section)
              <div className="flex flex-col gap-3">
                {statesWithUnits.map((state) => (
                  <div key={state.id}>
                    <StateCard
                      stateName={state.name}
                      unitCount={state.units.length}
                      isActive={selectedState === state.id}
                      onClick={() => handleStateClick(state.id)}
                    />

                    {selectedState === state.id && (
                      <div className="mt-2 mb-1 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                        {/* District multi-select */}
                        <div className="mb-4 flex items-center gap-3">
                          <MapPin className="h-4 w-4 flex-shrink-0 text-indigo-500" />
                          <p className="text-[13px] font-bold text-indigo-900">
                            Select districts in{' '}
                            <span className="text-indigo-600">{state.name}</span>
                          </p>
                        </div>

                        <MultiSelectDropdown
                          id={`pu-district-multiselect-${state.name.toLowerCase().replace(/\s+/g, '-')}`}
                          options={districtOptions}
                          selected={selectedDistricts}
                          onChange={setSelectedDistricts}
                          placeholder="Select one or more districts…"
                          searchPlaceholder="Search districts…"
                          maxTagsShown={3}
                        />

                        {/* Units list */}
                        {selectedDistricts.length > 0 && (
                          <div className="mt-6">
                            <div className="mb-3 flex items-center gap-2">
                              <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                                Program Units
                                {selectedDistricts.length === 1
                                  ? ` — ${districtOptions.find((o) => o.value === selectedDistricts[0])?.label ?? ''}`
                                  : ` — ${selectedDistricts.length} districts`}
                              </p>
                              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-600">
                                {displayedUnits.length}
                              </span>
                            </div>

                            {displayedUnits.length === 0 ? (
                              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center">
                                <Building2 className="h-6 w-6 animate-pulse text-gray-400" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-700">
                                    No program units found
                                  </p>
                                  <p className="text-gray-450 mt-0.5 text-[13px]">
                                    No units registered in the selected districts yet.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {displayedUnits.map((unit) => (
                                  <div
                                    key={unit._id}
                                    onClick={() => openUnitDetails(unit)}
                                    className="group hover:shadow-indigo-150/40 relative flex cursor-pointer flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:border-indigo-400 hover:shadow-md"
                                  >
                                    <span className="text-indigo-650 absolute top-4 right-4 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                      PU
                                    </span>
                                    <div>
                                      <p className="pr-10 text-[14px] leading-snug font-bold text-gray-900 transition-colors group-hover:text-indigo-600">
                                        {unit.orgn_name}
                                      </p>
                                      <p className="mt-0.5 text-xs font-semibold text-gray-500">
                                        {unit.orgn_id}
                                      </p>
                                    </div>
                                    <div className="mt-1 flex flex-col gap-1.5 text-xs text-gray-500">
                                      {(unit.orgn_place || getDistrictName(unit) !== '—') && (
                                        <span className="flex items-center gap-1.5 font-medium">
                                          <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                          {[unit.orgn_place, getDistrictName(unit)]
                                            .filter(Boolean)
                                            .join(', ')}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-indigo-650 mt-auto flex items-center justify-end pt-2 opacity-0 transition-opacity group-hover:opacity-100">
                                      <span className="text-xs font-bold">View details</span>
                                      <ChevronRight className="h-4 w-4" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                <p className="text-xs text-gray-500">Fill in both tabs, then submit.</p>
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
                      if (Object.keys(e).length > 0) {
                        setErrors(e);
                        return;
                      }
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
                      activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
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
                        <label
                          htmlFor="select-state"
                          className="mb-1.5 block text-xs font-semibold text-gray-700"
                        >
                          State *
                        </label>
                        <select
                          id="select-state"
                          name="orgn_state"
                          value={form.orgn_state}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                        <label
                          htmlFor="select-district"
                          className="mb-1.5 block text-xs font-semibold text-gray-700"
                        >
                          District
                        </label>
                        <select
                          id="select-district"
                          name="orgn_district"
                          value={form.orgn_district}
                          onChange={handleChange}
                          disabled={!form.orgn_state || loadingDistricts}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
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
                    <div className="flex items-start gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3.5 text-sm text-indigo-800 shadow-sm">
                      <AlertCircle className="h-5 w-5 shrink-0 text-indigo-500" />
                      <div>
                        <p className="font-bold">Default Login Password</p>
                        <p className="mt-0.5 text-indigo-700/90">
                          The coordinator's account will be created with the default password:{' '}
                          <code className="ml-1 rounded bg-indigo-100 px-1.5 py-0.5 font-mono font-bold text-indigo-900">
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
              <div className="flex items-center justify-between rounded-b-2xl border-t border-gray-200 bg-gray-50 px-6 py-4">
                {activeTab === TABS[0] ? (
                  <>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-next-tab"
                      type="button"
                      onClick={handleNextTab}
                      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
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
                      className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                    >
                      <ChevronRight className="h-4 w-4 rotate-180" /> Back
                    </button>
                    <button
                      id="btn-submit-program-unit"
                      type="submit"
                      disabled={submitting}
                      className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-70"
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
      <EditProgramUnitModal
        isOpen={showEditUnitModal}
        onClose={() => setShowEditUnitModal(false)}
        unit={selectedUnit}
        onSubmit={handleEditUnitSubmit}
      />

      {selectedCoordinator && (
        <EditUserModal
          isOpen={showEditCoordinatorModal}
          onClose={() => setShowEditCoordinatorModal(false)}
          user={
            {
              id: selectedCoordinator._id,
              name: selectedCoordinator.name,
              email: selectedCoordinator.email,
              phone: selectedCoordinator.mobile,
              designation: selectedCoordinator.designation || '',
              role: selectedCoordinator.role_id?.name || '',
              department: selectedUnit?.orgn_name || '',
              status: selectedCoordinator.active ? 'Active' : 'Inactive',
              gender: 'Other',
              joinedDate: '',
              avatarInitials: selectedCoordinator.name.substring(0, 2).toUpperCase(),
              avatarColor: 'from-emerald-500 to-teal-600',
            } as UserItem
          }
          onSubmit={handleEditCoordinatorSubmit}
        />
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
      {icon && <span className="absolute top-1/2 left-3 -translate-y-1/2">{icon}</span>}
      <input
        id={id}
        name={name}
        className={`w-full rounded-lg border bg-white py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition outline-none focus:ring-1 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/30'
        } ${icon ? 'pr-3 pl-10' : 'px-3'}`}
        {...rest}
      />
    </div>
    {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
  </div>
);

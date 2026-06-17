import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users as UsersIcon,
  Shield,
  Building2,
  ChevronDown,
  MapPin,
  Briefcase,
  CheckCircle2,
  XCircle,
  Package,
  Search,
  X,
  Plus,
} from 'lucide-react';
import {
  NSS_USERS,
  PMU_USERS,
  PROGRAM_UNIT_USERS,
  UserItem,
  ProgramUnitUser,
} from '../features/userManagement/data/userManagementData';
import { organizationService, Member } from '../services/organization.service';
import { UserDetailDrawer } from '../features/userManagement/components/UserDetailDrawer';
import { AddUserModal, AddUserFormData } from '../features/userManagement/components/AddUserModal';
import {
  EditUserModal,
  EditUserFormData,
} from '../features/userManagement/components/EditUserModal';
import { MultiSelectDropdown, MultiSelectOption } from '../components/ui/MultiSelectDropdown';
import { StateCard } from '../features/programUnit/components/StateCard';
import { api } from '../api/axios';

/* ─────────────────────────────────────────────
   USER CARD
───────────────────────────────────────────── */

const UserCard = ({ user, onClick }: { user: UserItem; onClick: () => void }) => {
  const statusBadge =
    user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600';

  return (
    <button
      id={`user-card-${user.id}`}
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 text-left transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-md"
    >
      {/* Avatar */}
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${user.avatarColor} text-[13px] font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105`}
      >
        {user.avatarInitials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-indigo-700">
            {user.name}
          </p>
          <span
            className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge}`}
          >
            {user.status === 'Active' ? (
              <CheckCircle2 className="h-2.5 w-2.5" />
            ) : (
              <XCircle className="h-2.5 w-2.5" />
            )}
            {user.status}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[12px] text-gray-500">{user.email}</p>
        {user.designation && (
          <div className="mt-1 flex items-center gap-1.5">
            <Briefcase className="h-3 w-3 flex-shrink-0 text-gray-400" />
            <p className="truncate text-[11px] text-gray-400">{user.designation}</p>
          </div>
        )}
      </div>

      {/* Role badge */}
      <span className="hidden flex-shrink-0 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 transition-colors group-hover:bg-indigo-100 sm:block">
        {user.role}
      </span>
    </button>
  );
};

/* ─────────────────────────────────────────────
   PROGRAM UNIT USER CARD (shows unit name)
───────────────────────────────────────────── */

const PuUserCard = ({ user, onClick }: { user: ProgramUnitUser; onClick: () => void }) => {
  const statusBadge =
    user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600';

  return (
    <button
      id={`pu-user-card-${user.id}`}
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 text-left transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-md"
    >
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${user.avatarColor} text-[13px] font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105`}
      >
        {user.avatarInitials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-indigo-700">
            {user.name}
          </p>
          <span
            className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge}`}
          >
            {user.status === 'Active' ? (
              <CheckCircle2 className="h-2.5 w-2.5" />
            ) : (
              <XCircle className="h-2.5 w-2.5" />
            )}
            {user.status}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[12px] text-gray-500">{user.email}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <Building2 className="h-3 w-3 flex-shrink-0 text-indigo-400" />
          <p className="truncate text-[11px] text-indigo-500">{user.unitName}</p>
        </div>
      </div>
      {user.designation && (
        <span className="hidden flex-shrink-0 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 transition-colors group-hover:bg-indigo-100 sm:block">
          {user.designation}
        </span>
      )}
    </button>
  );
};

/* ─────────────────────────────────────────────
   CUSTOM ACCORDION SECTION
───────────────────────────────────────────── */

interface AccordionSectionProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  accentColor: string; // e.g. 'indigo' | 'violet' | 'emerald'
  children: React.ReactNode;
}

const AccordionSection = ({
  id,
  icon,
  title,
  subtitle,
  count,
  isOpen,
  onToggle,
  accentColor,
  children,
}: AccordionSectionProps) => {
  const colorMap: Record<
    string,
    { header: string; icon: string; badge: string; border: string; bg: string }
  > = {
    indigo: {
      header: isOpen
        ? 'border-indigo-200 bg-indigo-50/60 shadow-sm shadow-indigo-100'
        : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30',
      icon: isOpen ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600',
      badge: isOpen ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-100 text-gray-500',
      border: 'border-indigo-100',
      bg: 'bg-indigo-50/40',
    },
    violet: {
      header: isOpen
        ? 'border-violet-200 bg-violet-50/60 shadow-sm shadow-violet-100'
        : 'border-gray-200 bg-white hover:border-violet-200 hover:bg-violet-50/30',
      icon: isOpen ? 'bg-violet-600 text-white' : 'bg-violet-100 text-violet-600',
      badge: isOpen ? 'bg-violet-200 text-violet-800' : 'bg-gray-100 text-gray-500',
      border: 'border-violet-100',
      bg: 'bg-violet-50/40',
    },
    emerald: {
      header: isOpen
        ? 'border-emerald-200 bg-emerald-50/60 shadow-sm shadow-emerald-100'
        : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30',
      icon: isOpen ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600',
      badge: isOpen ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-100 text-gray-500',
      border: 'border-emerald-100',
      bg: 'bg-emerald-50/40',
    },
  };

  const c = colorMap[accentColor] ?? colorMap.indigo;

  return (
    <div className={`overflow-hidden rounded-2xl border transition-all duration-300 ${c.header}`}>
      {/* Header */}
      <button
        id={`accordion-${id}`}
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-6 py-5 text-left focus:outline-none"
        aria-expanded={isOpen}
      >
        {/* Icon */}
        <span
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${c.icon}`}
        >
          {icon}
        </span>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <p className={`text-[15px] font-semibold ${isOpen ? 'text-gray-900' : 'text-gray-800'}`}>
            {title}
          </p>
          <p className="mt-0.5 text-[12px] text-gray-400">{subtitle}</p>
        </div>

        {/* Count badge */}
        <span
          className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${c.badge}`}
        >
          {count}
        </span>

        {/* Chevron */}
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Body */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={`border-t ${c.border} ${c.bg} px-6 py-5`}>{children}</div>
      </div>
    </div>
  );
};

/* ───────────────────────────────────────────────
   SEARCH RESULTS PANEL
─────────────────────────────────────────────── */

type SearchResultSource = 'NSS' | 'PMU' | 'Program Unit';
interface SearchResult {
  user: UserItem;
  source: SearchResultSource;
}

const SOURCE_STYLES: Record<SearchResultSource, { badge: string; dot: string }> = {
  NSS: { badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  PMU: { badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  'Program Unit': { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
};

const SearchResultCard = ({ result, onClick }: { result: SearchResult; onClick: () => void }) => {
  const { user, source } = result;
  const statusBadge =
    user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600';
  const s = SOURCE_STYLES[source];
  const puUser = user as ProgramUnitUser;

  return (
    <button
      id={`search-result-${user.id}`}
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 text-left transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-md"
    >
      {/* Avatar */}
      <div
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
          user.avatarColor
        } text-[13px] font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105`}
      >
        {user.avatarInitials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-indigo-700">
            {user.name}
          </p>
          {/* Source badge */}
          <span
            className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {source}
          </span>
          {/* Status badge */}
          <span
            className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge}`}
          >
            {user.status === 'Active' ? (
              <CheckCircle2 className="h-2.5 w-2.5" />
            ) : (
              <XCircle className="h-2.5 w-2.5" />
            )}
            {user.status}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[12px] text-gray-500">{user.email}</p>
        <div className="mt-1 flex items-center gap-1.5">
          {source === 'Program Unit' && puUser.unitName ? (
            <>
              <Building2 className="h-3 w-3 flex-shrink-0 text-emerald-400" />
              <p className="truncate text-[11px] text-emerald-600">{puUser.unitName}</p>
            </>
          ) : user.designation ? (
            <>
              <Briefcase className="h-3 w-3 flex-shrink-0 text-gray-400" />
              <p className="truncate text-[11px] text-gray-400">{user.designation}</p>
            </>
          ) : null}
        </div>
      </div>

      {/* Right: role + state info */}
      <div className="hidden flex-shrink-0 flex-col items-end gap-1 sm:flex">
        <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 transition-colors group-hover:bg-indigo-100">
          {user.role}
        </span>
        {source === 'Program Unit' && puUser.state && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <MapPin className="h-2.5 w-2.5" />
            {puUser.district}, {puUser.state}
          </span>
        )}
      </div>
    </button>
  );
};

const GlobalSearchResults = ({
  query,
  results,
  onUserClick,
}: {
  query: string;
  results: SearchResult[];
  onUserClick: (user: UserItem) => void;
}) => {
  if (results.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          {/* Illustration */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-50">
            <Search className="h-9 w-9 text-gray-300" />
            <div className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-400 ring-2 ring-white">
              <X className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-gray-800">No users found</p>
            <p className="mt-1 text-[13px] text-gray-400">
              No results for{' '}
              <span className="font-semibold text-gray-600">&ldquo;{query}&rdquo;</span> across NSS,
              PMU, or Program Unit users.
            </p>
          </div>
          <div className="mt-1 flex flex-wrap justify-center gap-2 text-[12px] text-gray-400">
            <span>Try searching by name,</span>
            <span>email address,</span>
            <span>or designation.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {/* Result header */}
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Search className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-[15px] font-semibold text-gray-900">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </h2>
          <p className="text-[12px] text-gray-400">
            Matching &ldquo;{query}&rdquo; across all user groups
          </p>
        </div>
        {/* Source breakdown pills */}
        <div className="ml-auto hidden items-center gap-2 sm:flex">
          {(['NSS', 'PMU', 'Program Unit'] as SearchResultSource[]).map((src) => {
            const count = results.filter((r) => r.source === src).length;
            if (count === 0) return null;
            return (
              <span
                key={src}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${SOURCE_STYLES[src].badge}`}
              >
                {src}: {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {results.map((result) => (
          <SearchResultCard
            key={result.user.id}
            result={result}
            onClick={() => onUserClick(result.user)}
          />
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────── */
const EmptyUsers = ({ districts }: { districts: string[] }) => (
  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 py-12 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
      <Package className="h-6 w-6 text-gray-400" />
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-700">No users found</p>
      <p className="mt-0.5 text-[13px] text-gray-400">
        No users registered in <span className="font-medium">{districts.join(', ')}</span> yet.
      </p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   PROGRAM UNIT USERS SECTION INNER
───────────────────────────────────────────── */

const ProgramUnitUsersContent = ({
  users: apiUsers,
  onUserClick,
}: {
  users: ProgramUnitUser[];
  onUserClick: (user: UserItem) => void;
}) => {
  const states = useMemo(() => {
    const s = new Set(apiUsers.map((u) => u.state));
    return [...s].sort();
  }, [apiUsers]);

  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  const districtOptions: MultiSelectOption[] = useMemo(() => {
    if (!selectedState) return [];
    const d = new Set(apiUsers.filter((u) => u.state === selectedState).map((u) => u.district));
    return [...d].sort().map((dist) => ({ value: dist, label: dist }));
  }, [selectedState, apiUsers]);

  const displayedUsers = useMemo(() => {
    if (!selectedState || selectedDistricts.length === 0) return [];
    return apiUsers.filter(
      (u) => u.state === selectedState && selectedDistricts.includes(u.district),
    );
  }, [selectedState, selectedDistricts, apiUsers]);

  const getUserCountByState = (state: string) => apiUsers.filter((u) => u.state === state).length;

  const handleStateClick = (state: string) => {
    if (selectedState === state) {
      setSelectedState(null);
      setSelectedDistricts([]);
    } else {
      setSelectedState(state);
      setSelectedDistricts([]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Label */}
      <div className="mb-2 flex items-center gap-2">
        <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
          States &amp; UTs
        </p>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
          {states.length}
        </span>
        {selectedState && (
          <span className="ml-auto text-[12px] font-medium text-emerald-600">
            {selectedState}
            {selectedDistricts.length > 0 && (
              <span className="ml-1 text-emerald-400">
                · {selectedDistricts.length} district
                {selectedDistricts.length !== 1 ? 's' : ''}
              </span>
            )}
          </span>
        )}
      </div>

      {states.map((state) => (
        <div key={state}>
          <StateCard
            stateName={state}
            unitCount={getUserCountByState(state)}
            isActive={selectedState === state}
            onClick={() => handleStateClick(state)}
          />

          {/* Expanded panel below active state */}
          {selectedState === state && (
            <div className="mt-2 mb-1 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
              {/* District multi-select */}
              <div className="mb-4 flex items-center gap-3">
                <MapPin className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                <p className="text-[13px] font-semibold text-emerald-800">
                  Select districts in <span className="text-emerald-600">{state}</span>
                </p>
              </div>

              <MultiSelectDropdown
                id={`pu-district-multiselect-${state.toLowerCase().replace(/\s+/g, '-')}`}
                options={districtOptions}
                selected={selectedDistricts}
                onChange={setSelectedDistricts}
                placeholder="Select one or more districts…"
                searchPlaceholder="Search districts…"
                maxTagsShown={3}
              />

              {/* Users list */}
              {selectedDistricts.length > 0 && (
                <div className="mt-5">
                  <div className="mb-3 flex items-center gap-2">
                    <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
                      Users
                      {selectedDistricts.length === 1
                        ? ` — ${selectedDistricts[0]}`
                        : ` — ${selectedDistricts.length} districts`}
                    </p>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                      {displayedUsers.length}
                    </span>
                  </div>

                  {displayedUsers.length === 0 ? (
                    <EmptyUsers districts={selectedDistricts} />
                  ) : (
                    <div className="flex flex-col gap-2">
                      {displayedUsers.map((u) => (
                        <PuUserCard key={u.id} user={u} onClick={() => onUserClick(u)} />
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
  );
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */

export const Users = () => {
  const [openAccordion, setOpenAccordion] = useState<string | null>('nss');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const [puUsers, setPuUsers] = useState<ProgramUnitUser[]>([]);
  const [nssUsers, setNssUsers] = useState<UserItem[]>([]);
  const [pmuUsers, setPmuUsers] = useState<UserItem[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await organizationService.getAllMembers();
      const apiMembers = response.data || [];

      const mappedPuUsers: ProgramUnitUser[] = apiMembers
        .filter((m: Member) => m.organization?.orgn_type === 'PU')
        .map((m: Member) => {
          const org = m.organization;
          return {
            id: m._id,
            name: m.name,
            email: m.email,
            designation: m.designation || '',
            phone: m.mobile,
            department: org?.orgn_name || 'N/A',
            role: m.role_id?.name || 'Programme Officer',
            state:
              org?.orgn_state && typeof org.orgn_state === 'object'
                ? org.orgn_state.state_name
                : 'Unknown State',
            district:
              org?.orgn_district && typeof org.orgn_district === 'object'
                ? org.orgn_district.district_name
                : 'Unknown District',
            unitName: org?.orgn_name || 'Unknown Unit',
            gender: 'Other',
            joinedDate: m.joinedAt
              ? new Date(m.joinedAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Unknown',
            status: m.active ? 'Active' : 'Inactive',
            avatarInitials: m.name.substring(0, 2).toUpperCase(),
            avatarColor: 'from-emerald-500 to-teal-600',
          } as ProgramUnitUser;
        });

      const mappedNssUsers: UserItem[] = apiMembers
        .filter((m: Member) => {
          const roleStr = m.role_id?.name;
          console.log('roleStr', roleStr);
          return roleStr === 'NSS_Admin' || roleStr === 'NSS_User';
        })
        .map((m: Member) => {
          const org = m.organization;
          return {
            id: m._id,
            name: m.name,
            email: m.email,
            designation: m.designation || '',
            phone: m.mobile,
            department: org?.orgn_name || 'N/A',
            role: m.role_id?.name || 'User',
            gender: 'Other',
            joinedDate: m.joinedAt
              ? new Date(m.joinedAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Unknown',
            status: m.active ? 'Active' : 'Inactive',
            avatarInitials: m.name.substring(0, 2).toUpperCase(),
            avatarColor: 'from-indigo-500 to-blue-600',
          } as UserItem;
        });

      const mappedPmuUsers: UserItem[] = apiMembers
        .filter((m: Member) => {
          const roleStr = m.role_id?.name || m.role_id?.name;
          return roleStr === 'PMU_Admin' || roleStr === 'PMU_User';
        })
        .map((m: Member) => {
          const org = m.organization;
          return {
            id: m._id,
            name: m.name,
            email: m.email,
            designation: m.designation || '',
            phone: m.mobile,
            department: org?.orgn_name || 'N/A',
            role: m.role_id?.name || 'User',
            gender: 'Other',
            joinedDate: m.joinedAt
              ? new Date(m.joinedAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Unknown',
            status: m.active ? 'Active' : 'Inactive',
            avatarInitials: m.name.substring(0, 2).toUpperCase(),
            avatarColor: 'from-violet-500 to-purple-600',
          } as UserItem;
        });

      setPuUsers(mappedPuUsers);
      setNssUsers(mappedNssUsers);
      setPmuUsers(mappedPmuUsers);
    } catch (error) {
      console.error('Failed to fetch users', error);
      setPuUsers(PROGRAM_UNIT_USERS); // Fallback to static on error
      setNssUsers(NSS_USERS);
      setPmuUsers(PMU_USERS);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

  // ── Global search: query all three pools ──
  const q = searchQuery.toLowerCase();
  const allSearchResults = useMemo((): SearchResult[] => {
    if (!q) return [];
    const matches = (u: UserItem) =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.designation.toLowerCase().includes(q) ||
      (u.department ?? '').toLowerCase().includes(q) ||
      (u.role ?? '').toLowerCase().includes(q);

    const nssHits: SearchResult[] = nssUsers.filter(matches).map((u) => ({
      user: u,
      source: 'NSS' as const,
    }));
    const pmuHits: SearchResult[] = pmuUsers.filter(matches).map((u) => ({
      user: u,
      source: 'PMU' as const,
    }));
    const puHits: SearchResult[] = puUsers
      .filter(
        (u) =>
          matches(u) ||
          (u.unitName ?? '').toLowerCase().includes(q) ||
          (u.state ?? '').toLowerCase().includes(q) ||
          (u.district ?? '').toLowerCase().includes(q),
      )
      .map((u) => ({ user: u, source: 'Program Unit' as const }));

    return [...nssHits, ...pmuHits, ...puHits];
  }, [q]);

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  const handleAddUser = async (data: AddUserFormData) => {
    try {
      await api.post('/members', data);
      setShowAddModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error adding user', error);
      alert('Failed to add user');
    }
  };

  const handleEditUser = async (data: EditUserFormData) => {
    if (!selectedUser) return;
    try {
      await api.put(`/members/${selectedUser.id}`, data);
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user', error);
      alert('Failed to update user');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="mb-6 rounded-2xl bg-white shadow-sm">
        {/* Title row */}
        <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">User Management</h1>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Manage NSS, PMU, and Program Unit users across all states and districts
            </p>
          </div>

          {/* Search + Add User actions */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="flex items-center gap-2 rounded-xl border border-indigo-300 bg-white px-3 py-2 shadow-md ring-1 ring-indigo-100">
                <Search className="h-4 w-4 flex-shrink-0 text-indigo-400" />
                <input
                  id="user-search-input"
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users…"
                  className="w-48 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
                <button
                  id="user-search-close"
                  onClick={() => setSearchOpen(false)}
                  className="ml-1 rounded-full p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="user-search-open"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all duration-150 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            )}

            <button
              id="add-user-btn"
              onClick={() => setShowAddModal(true)}
              className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 hover:shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex flex-wrap gap-3 border-t border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Shield className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-indigo-400 uppercase">
                NSS Users
              </p>
              <p className="text-[14px] font-bold text-indigo-700">{nssUsers.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white">
              <UsersIcon className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-violet-400 uppercase">
                PMU Users
              </p>
              <p className="text-[14px] font-bold text-violet-700">{pmuUsers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Global Search Results OR Accordion List ── */}
      {q ? (
        <GlobalSearchResults
          query={searchQuery}
          results={allSearchResults}
          onUserClick={setSelectedUser}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {/* 1. NSS Users */}
          <AccordionSection
            id="nss"
            icon={<Shield className="h-5 w-5" />}
            title="NSS Users"
            subtitle="National Service Scheme headquarters and administrative staff"
            count={nssUsers.length}
            isOpen={openAccordion === 'nss'}
            onToggle={() => toggleAccordion('nss')}
            accentColor="indigo"
          >
            <div className="flex flex-col gap-2">
              {nssUsers.map((user) => (
                <UserCard key={user.id} user={user} onClick={() => setSelectedUser(user)} />
              ))}
            </div>
          </AccordionSection>

          {/* 2. PMU Users */}
          <AccordionSection
            id="pmu"
            icon={<UsersIcon className="h-5 w-5" />}
            title="PMU Users"
            subtitle="Programme Management Unit members and operational staff"
            count={pmuUsers.length}
            isOpen={openAccordion === 'pmu'}
            onToggle={() => toggleAccordion('pmu')}
            accentColor="violet"
          >
            <div className="flex flex-col gap-2">
              {pmuUsers.map((user) => (
                <UserCard key={user.id} user={user} onClick={() => setSelectedUser(user)} />
              ))}
            </div>
          </AccordionSection>

          {/* 3. Program Unit Users */}
          <AccordionSection
            id="program-unit"
            icon={<Building2 className="h-5 w-5" />}
            title="Program Unit Users"
            subtitle="State-wise NSS programme officers and coordinators"
            count={new Set(puUsers.map((u) => u.state)).size}
            isOpen={openAccordion === 'program-unit'}
            onToggle={() => toggleAccordion('program-unit')}
            accentColor="emerald"
          >
            <ProgramUnitUsersContent users={puUsers} onUserClick={setSelectedUser} />
          </AccordionSection>
        </div>
      )}

      {/* Modals & Drawers */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
      />
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={selectedUser}
        onSubmit={handleEditUser}
      />
      <UserDetailDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onEditClick={() => setShowEditModal(true)}
      />
    </div>
  );
};

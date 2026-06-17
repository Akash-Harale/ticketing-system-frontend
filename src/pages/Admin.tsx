import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/axios';
import {
  Shield,
  Layers,
  Key,
  Plus,
  ChevronDown,
  Check,
  AlertCircle,
  CheckCircle,
  Building2,
  X,
} from 'lucide-react';
import { locationService, State, District } from '@/services/location.service';
import {
  organizationService,
  Organization,
  CreateOrganizationPayload,
} from '@/services/organization.service';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Resource {
  _id: string;
  name: string;
  description?: string;
}

interface Privilege {
  _id: string;
  name: string;
  action: string;
  resource: Resource | null;
  description?: string;
}

interface Role {
  _id: string;
  name: string;
  description?: string;
  privileges: Privilege[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getErrMsg(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

// ── Notification ──────────────────────────────────────────────────────────────
function useNotification() {
  const [note, setNote] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const show = (msg: string, type: 'success' | 'error' = 'success') => {
    setNote({ msg, type });
    setTimeout(() => setNote(null), 4000);
  };

  const dismiss = () => setNote(null);

  return { note, show, dismiss };
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-3 rounded-t-2xl border-b border-gray-100 bg-gray-50/30 px-6 py-4">
        <span className="text-indigo-650 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50/70 ring-4 ring-indigo-50/30">
          <Icon className="h-4.5 w-4.5 text-indigo-600" />
        </span>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function ActionBadge({ action }: { action: string }) {
  const colours: Record<string, string> = {
    CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-150 ring-1 ring-emerald-600/10',
    READ: 'bg-blue-50 text-blue-700 border-blue-150 ring-1 ring-blue-600/10',
    UPDATE: 'bg-amber-50 text-amber-700 border-amber-150 ring-1 ring-amber-600/10',
    DELETE: 'bg-rose-50 text-rose-700 border-rose-150 ring-1 ring-rose-600/10',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${colours[action] ?? 'border-gray-200 bg-gray-50 text-gray-600'}`}
    >
      {action}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Admin() {
  const { note, show, dismiss } = useNotification();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [resources, setResources] = useState<Resource[]>([]);
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // ── Tab state ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'RBAC' | 'ORG' | 'FEATURES'>('FEATURES');

  // ── Feature Matrix state ───────────────────────────────────────────────────
  const [tempRolePrivileges, setTempRolePrivileges] = useState<Record<string, string[]>>({});
  const [isSavingMatrix, setIsSavingMatrix] = useState(false);

  const appFeatures = [
    {
      key: 'program_unit_view',
      name: 'View Program Units',
      resource: 'Program_Unit',
      action: 'READ',
      description: 'Allows viewing program unit states, districts, and details.',
    },
    {
      key: 'program_unit_create',
      name: 'Add New Program Unit',
      resource: 'Program_Unit',
      action: 'CREATE',
      description: 'Allows adding new program units to the system.',
    },
    {
      key: 'program_unit_update',
      name: 'Edit Program Unit Details',
      resource: 'Program_Unit',
      action: 'UPDATE',
      description: 'Allows modifying program unit or coordinator info.',
    },
    {
      key: 'program_unit_delete',
      name: 'Delete Program Unit',
      resource: 'Program_Unit',
      action: 'DELETE',
      description: 'Allows removing program units from the directory.',
    },
    {
      key: 'users_view',
      name: 'View User Management',
      resource: 'Users',
      action: 'READ',
      description: 'Allows viewing active NSS and PMU administrators and users.',
    },
    {
      key: 'users_create',
      name: 'Add New Member / User',
      resource: 'Users',
      action: 'CREATE',
      description: 'Allows creating new members and corresponding login accounts.',
    },
    {
      key: 'users_update',
      name: 'Edit Member Details',
      resource: 'Users',
      action: 'UPDATE',
      description: 'Allows updating name, mobile, and status of members.',
    },
    {
      key: 'users_delete',
      name: 'Delete Member Account',
      resource: 'Users',
      action: 'DELETE',
      description: 'Allows deleting members and closing login accounts.',
    },
    {
      key: 'rollout_view',
      name: 'View Rollout Campaigns',
      resource: 'Rollout',
      action: 'READ',
      description: 'Allows viewing templates and rollout campaign logs.',
    },
    {
      key: 'rollout_create',
      name: 'Create Rollout Campaigns',
      resource: 'Rollout',
      action: 'CREATE',
      description: 'Allows launching new task rollouts and templates.',
    },
    {
      key: 'knowledge_view',
      name: 'View Knowledge Base',
      resource: 'Mediacorner',
      action: 'READ',
      description: 'Allows browsing files and learning resources in the Media Corner.',
    },
    {
      key: 'knowledge_create',
      name: 'Add to Knowledge Base',
      resource: 'Mediacorner',
      action: 'CREATE',
      description: 'Allows upload of documents, videos, and articles to the media portal.',
    },
    {
      key: 'rbac_view',
      name: 'View Administration & RBAC',
      resource: 'RBAC',
      action: 'READ',
      description: 'Allows access to the Admin tab to view system rules.',
    },
    {
      key: 'rbac_manage',
      name: 'Manage System Features & RBAC',
      resource: 'RBAC',
      action: 'UPDATE',
      description: 'Allows assigning roles, editing privileges, and managing feature matrices.',
    },
  ];

  // Sync temp privileges when roles state updates
  useEffect(() => {
    if (roles.length > 0) {
      const initialMatrix: Record<string, string[]> = {};
      roles.forEach((r) => {
        initialMatrix[r._id] = r.privileges.map((p) => p._id);
      });
      setTempRolePrivileges(initialMatrix);
    }
  }, [roles]);

  const findPrivilegeId = (resourceName: string, actionName: string): string | undefined => {
    return privileges.find(
      (p) =>
        p.resource?.name?.toLowerCase() === resourceName.toLowerCase() &&
        p.action?.toUpperCase() === actionName.toUpperCase(),
    )?._id;
  };

  const handleToggleMatrixPrivilege = (roleId: string, privilegeId: string) => {
    setTempRolePrivileges((prev) => {
      const currentPrivs = prev[roleId] ?? [];
      const updatedPrivs = currentPrivs.includes(privilegeId)
        ? currentPrivs.filter((id) => id !== privilegeId)
        : [...currentPrivs, privilegeId];
      return { ...prev, [roleId]: updatedPrivs };
    });
  };

  const handleSaveMatrix = async () => {
    setIsSavingMatrix(true);
    let successCount = 0;
    let failCount = 0;

    for (const role of roles) {
      const currentPrivs = role.privileges.map((p) => p._id).sort();
      const tempPrivs = (tempRolePrivileges[role._id] ?? []).sort();

      const hasChanges =
        currentPrivs.length !== tempPrivs.length ||
        !currentPrivs.every((val, index) => val === tempPrivs[index]);

      if (hasChanges) {
        try {
          await api.put(`/rbac/roles/${role._id}/privileges`, {
            privileges: tempRolePrivileges[role._id] ?? [],
          });
          successCount++;
        } catch {
          failCount++;
        }
      }
    }

    setIsSavingMatrix(false);
    if (successCount > 0 && failCount === 0) {
      show(`Successfully saved feature permissions for ${successCount} roles.`);
      fetchRoles();
    } else if (successCount > 0 && failCount > 0) {
      show(`Saved changes for ${successCount} roles. Failed for ${failCount} roles.`, 'error');
      fetchRoles();
    } else if (failCount > 0) {
      show(`Failed to save feature changes.`, 'error');
    } else {
      show('No changes detected to save.');
    }
  };

  // ── Organization state ──────────────────────────────────────────────────────
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [newOrg, setNewOrg] = useState<Partial<CreateOrganizationPayload>>({
    orgn_id: '',
    orgn_type: 'PU',
    orgn_name: '',
    orgn_address1: '',
    orgn_address2: '',
    orgn_place: '',
    orgn_state: '',
    orgn_district: '',
    orgn_pincode: '',
  });

  // ── Form state ──────────────────────────────────────────────────────────────
  const [newResource, setNewResource] = useState({ name: '', description: '' });
  const [newPrivilege, setNewPrivilege] = useState({
    name: '',
    resource: '',
    action: 'READ',
    description: '',
  });
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  // Role-privilege assignment
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([]);

  // ── Fetch helpers ────────────────────────────────────────────────────────────
  const fetchResources = useCallback(async () => {
    try {
      const { data } = await api.get('/rbac/resources');
      setResources(data.data.resources);
    } catch {
      show('Failed to load resources.', 'error');
    }
  }, []);

  const fetchPrivileges = useCallback(async () => {
    try {
      const { data } = await api.get('/rbac/privileges');
      setPrivileges(data.data.privileges);
    } catch {
      show('Failed to load privileges.', 'error');
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const { data } = await api.get('/rbac/roles');
      setRoles(data.data.roles);
    } catch {
      show('Failed to load roles.', 'error');
    }
  }, []);

  const fetchOrganizations = useCallback(async () => {
    try {
      const res = await organizationService.getAll();
      if (res.success) setOrganizations(res.data);
    } catch {
      show('Failed to load organizations.', 'error');
    }
  }, []);

  const fetchStates = useCallback(async () => {
    try {
      const data = await locationService.getStates();
      setStates(data);
    } catch {
      show('Failed to load states.', 'error');
    }
  }, []);

  useEffect(() => {
    fetchResources();
    fetchPrivileges();
    fetchRoles();
    fetchOrganizations();
    fetchStates();
  }, []);

  useEffect(() => {
    if (newOrg.orgn_state) {
      locationService
        .getDistrictsByState(newOrg.orgn_state)
        .then(setDistricts)
        .catch(() => show('Failed to load districts.', 'error'));
    } else {
      setDistricts([]);
    }
  }, [newOrg.orgn_state]);

  // ── When selectedRole changes, pre-tick its current privileges ──────────────
  useEffect(() => {
    if (!selectedRole) {
      setSelectedPrivileges([]);
      return;
    }
    const role = roles.find((r) => r._id === selectedRole);
    setSelectedPrivileges(role?.privileges.map((p) => p._id) ?? []);
  }, [selectedRole, roles]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  async function handleCreateResource(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/rbac/resources', newResource);
      setNewResource({ name: '', description: '' });
      show('Resource created successfully.');
      fetchResources();
    } catch (err: unknown) {
      show(getErrMsg(err, 'Failed to create resource.'), 'error');
    }
  }

  async function handleCreatePrivilege(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/rbac/privileges', {
        ...newPrivilege,
        name:
          newPrivilege.name ||
          `${newPrivilege.action}_${resources.find((r) => r._id === newPrivilege.resource)?.name?.toUpperCase() ?? 'RESOURCE'}`,
      });
      setNewPrivilege({ name: '', resource: '', action: 'READ', description: '' });
      show('Privilege created successfully.');
      fetchPrivileges();
    } catch (err: unknown) {
      show(getErrMsg(err, 'Failed to create privilege.'), 'error');
    }
  }

  async function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/rbac/roles', newRole);
      setNewRole({ name: '', description: '' });
      show('Role created successfully.');
      fetchRoles();
    } catch (err: unknown) {
      show(getErrMsg(err, 'Failed to create role.'), 'error');
    }
  }

  async function handleSaveRolePrivileges() {
    if (!selectedRole) {
      show('Please select a role first.', 'error');
      return;
    }
    try {
      await api.put(`/rbac/roles/${selectedRole}/privileges`, {
        privileges: selectedPrivileges,
      });
      show('Permissions updated successfully.');
      fetchRoles();
    } catch (err: unknown) {
      show(getErrMsg(err, 'Failed to update permissions.'), 'error');
    }
  }

  async function handleCreateOrganization(e: React.FormEvent) {
    e.preventDefault();
    if (
      !newOrg.orgn_id ||
      !newOrg.orgn_type ||
      !newOrg.orgn_name ||
      !newOrg.orgn_state ||
      !newOrg.orgn_pincode
    ) {
      show('Please fill required organization fields.', 'error');
      return;
    }
    try {
      await organizationService.create(newOrg as CreateOrganizationPayload);
      setNewOrg({
        orgn_id: '',
        orgn_type: 'PU',
        orgn_name: '',
        orgn_address1: '',
        orgn_address2: '',
        orgn_place: '',
        orgn_state: '',
        orgn_district: '',
        orgn_pincode: '',
      });
      show('Organization created successfully.');
      fetchOrganizations();
    } catch (err: unknown) {
      show(getErrMsg(err, 'Failed to create organization.'), 'error');
    }
  }

  function togglePrivilege(id: string) {
    setSelectedPrivileges((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  const getHeaderStyle = (name: string) => {
    const norm = name.toLowerCase();
    if (norm.includes('superadmin')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (norm.includes('nss_admin')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (norm.includes('nss_user')) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (norm.includes('coordinator') || norm.includes('prog'))
      return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Dynamic Keyframes Animation Injection */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%) translateY(0);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage system configurations, access control, and organizations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200">
        <button
          className={`relative pb-3 text-sm font-bold transition-all duration-205 ${
            activeTab === 'FEATURES' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
          }`}
          onClick={() => setActiveTab('FEATURES')}
        >
          Feature Permissions
          {activeTab === 'FEATURES' && (
            <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-indigo-600" />
          )}
        </button>
        <button
          className={`relative pb-3 text-sm font-bold transition-all duration-205 ${
            activeTab === 'RBAC' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
          }`}
          onClick={() => setActiveTab('RBAC')}
        >
          RBAC Management
          {activeTab === 'RBAC' && (
            <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-indigo-600" />
          )}
        </button>
        <button
          className={`relative pb-3 text-sm font-bold transition-all duration-205 ${
            activeTab === 'ORG' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
          }`}
          onClick={() => setActiveTab('ORG')}
        >
          Organization Management
          {activeTab === 'ORG' && (
            <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-indigo-600" />
          )}
        </button>
      </div>

      {/* ── RBAC Section ───────────────────────────────────────────────────── */}
      {activeTab === 'RBAC' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="text-indigo-650 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 ring-4 ring-indigo-50/30">
                <Shield className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">RBAC Management</h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Configure resources, privileges, roles, and assign access permissions.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Resources */}
            <Section title="Resources" icon={Layers}>
              <div className="grid gap-8 md:grid-cols-2">
                {/* Create form */}
                <form onSubmit={handleCreateResource} className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-800">Create New Resource</h4>
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        Resource Name *
                      </label>
                      <input
                        required
                        placeholder="e.g. Program_Unit"
                        value={newResource.name}
                        onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm placeholder-gray-400 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        Description
                      </label>
                      <input
                        placeholder="Describe what this resource represents"
                        value={newResource.description}
                        onChange={(e) =>
                          setNewResource({ ...newResource, description: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm placeholder-gray-400 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="hover:shadow-indigo-150 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4" /> Create Resource
                  </button>
                </form>

                {/* List */}
                <div className="flex flex-col">
                  <h4 className="mb-3 text-sm font-bold text-gray-800">
                    Existing Resources ({resources.length})
                  </h4>
                  <div className="max-h-60 space-y-2.5 overflow-y-auto pr-1">
                    {resources.map((r) => (
                      <div
                        key={r._id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:border-indigo-200 hover:shadow"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="leading-none font-semibold text-gray-900">{r.name}</span>
                          {r.description && (
                            <span className="mt-1 text-xs text-gray-500">{r.description}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {resources.length === 0 && (
                      <p className="text-xs text-gray-400 italic">No resources found.</p>
                    )}
                  </div>
                </div>
              </div>
            </Section>

            {/* Privileges */}
            <Section title="Privileges" icon={Key}>
              <div className="grid gap-8 md:grid-cols-2">
                {/* Create form */}
                <form onSubmit={handleCreatePrivilege} className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-800">Create New Privilege</h4>
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        Resource *
                      </label>
                      <select
                        required
                        value={newPrivilege.resource}
                        onChange={(e) =>
                          setNewPrivilege({ ...newPrivilege, resource: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      >
                        <option value="">Select resource…</option>
                        {resources.map((r) => (
                          <option key={r._id} value={r._id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        Action *
                      </label>
                      <select
                        value={newPrivilege.action}
                        onChange={(e) =>
                          setNewPrivilege({ ...newPrivilege, action: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      >
                        {['CREATE', 'READ', 'UPDATE', 'DELETE'].map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        Custom Name
                      </label>
                      <input
                        placeholder="Auto-generated if blank (e.g. READ_USER)"
                        value={newPrivilege.name}
                        onChange={(e) => setNewPrivilege({ ...newPrivilege, name: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm placeholder-gray-400 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        Description
                      </label>
                      <input
                        placeholder="Describe this privilege"
                        value={newPrivilege.description}
                        onChange={(e) =>
                          setNewPrivilege({ ...newPrivilege, description: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm placeholder-gray-400 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="hover:shadow-indigo-150 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4" /> Create Privilege
                  </button>
                </form>

                {/* List */}
                <div className="flex flex-col">
                  <h4 className="mb-3 text-sm font-bold text-gray-800">
                    Existing Privileges ({privileges.length})
                  </h4>
                  <div className="max-h-[360px] space-y-2.5 overflow-y-auto pr-1">
                    {privileges.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:border-indigo-200 hover:shadow"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="leading-none font-semibold text-gray-900">{p.name}</span>
                          <span className="mt-1 text-xs text-gray-500">
                            {p.resource?.name ?? '—'}
                          </span>
                        </div>
                        <ActionBadge action={p.action} />
                      </div>
                    ))}
                    {privileges.length === 0 && (
                      <p className="text-xs text-gray-400 italic">No privileges found.</p>
                    )}
                  </div>
                </div>
              </div>
            </Section>

            {/* Roles */}
            <Section title="Roles & Permissions" icon={Shield}>
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Create role */}
                <form onSubmit={handleCreateRole} className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-800">Create New Role</h4>
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        Role Name *
                      </label>
                      <input
                        required
                        placeholder="e.g. Finance_Head"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm placeholder-gray-400 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        Description
                      </label>
                      <input
                        placeholder="Describe the role responsibilities"
                        value={newRole.description}
                        onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm placeholder-gray-400 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="hover:shadow-indigo-150 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4" /> Create Role
                  </button>
                </form>

                {/* Assign privileges to a role */}
                <div className="space-y-4 lg:col-span-2">
                  <h4 className="text-sm font-bold text-gray-800">Assign / Remove Permissions</h4>

                  {/* Role selector */}
                  <div className="relative">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 pr-10 text-sm transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <option value="">Choose a role to configure…</option>
                      {roles.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-3.5 right-3.5 h-4 w-4 text-gray-400" />
                  </div>

                  {/* Privilege checkboxes */}
                  {selectedRole && (
                    <div className="space-y-4">
                      <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                        {privileges.map((p) => {
                          const checked = selectedPrivileges.includes(p._id);
                          return (
                            <div
                              key={p._id}
                              onClick={() => togglePrivilege(p._id)}
                              className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-xs transition-all select-none ${
                                checked
                                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm'
                                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              <div
                                className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-lg border transition-all ${
                                  checked
                                    ? 'border-indigo-600 bg-indigo-600'
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                {checked && <Check className="h-3 w-3 stroke-[3px] text-white" />}
                              </div>
                              <span className="leading-tight font-semibold">{p.name}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500">
                          {selectedPrivileges.length} of {privileges.length} selected
                        </p>
                        <button
                          type="button"
                          onClick={handleSaveRolePrivileges}
                          className="hover:shadow-emerald-150 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
                        >
                          Save Permissions
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Roles overview table */}
              <div className="mt-8 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                      <th className="px-5 py-4">Role</th>
                      <th className="px-5 py-4">Description</th>
                      <th className="px-5 py-4">Permissions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-gray-150 divide-y">
                    {roles.map((role) => (
                      <tr key={role._id} className="transition-colors hover:bg-gray-50/30">
                        <td className="px-5 py-4 font-bold text-gray-900">{role.name}</td>
                        <td className="px-5 py-4 text-xs font-medium text-gray-500">
                          {role.description ?? '—'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex max-w-lg flex-wrap gap-1.5">
                            {role.privileges.length === 0 ? (
                              <span className="text-xs text-gray-400 italic">None</span>
                            ) : (
                              role.privileges.slice(0, 8).map((p) => (
                                <span
                                  key={p._id}
                                  className="text-indigo-750 rounded-lg border border-indigo-100 bg-indigo-50/65 px-2 py-0.5 text-[10px] font-bold"
                                >
                                  {p.name}
                                </span>
                              ))
                            )}
                            {role.privileges.length > 8 && (
                              <span className="self-center text-[10px] font-bold text-gray-400">
                                +{role.privileges.length - 8} more
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        </div>
      )}

      {/* ── Organization Section ────────────────────────────────────────────── */}
      {activeTab === 'ORG' && (
        <div className="space-y-6">
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
                <form onSubmit={handleCreateOrganization} className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-800">Create New Organization</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        Organization ID *
                      </label>
                      <input
                        required
                        placeholder="e.g. ORG-001"
                        value={newOrg.orgn_id}
                        onChange={(e) => setNewOrg({ ...newOrg, orgn_id: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm placeholder-gray-400 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        Org Type *
                      </label>
                      <select
                        required
                        value={newOrg.orgn_type}
                        onChange={(e) =>
                          setNewOrg({
                            ...newOrg,
                            orgn_type: e.target.value as CreateOrganizationPayload['orgn_type'],
                          })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      >
                        <option value="PU">Program Unit (PU)</option>
                        <option value="NSS">NSS</option>
                        <option value="PMU">PMU</option>
                        <option value="OTH">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                      Organization Name *
                    </label>
                    <input
                      required
                      placeholder="e.g. Pune University NSS"
                      value={newOrg.orgn_name}
                      onChange={(e) => setNewOrg({ ...newOrg, orgn_name: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm placeholder-gray-400 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        State *
                      </label>
                      <select
                        required
                        value={newOrg.orgn_state}
                        onChange={(e) =>
                          setNewOrg({ ...newOrg, orgn_state: e.target.value, orgn_district: '' })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
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
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        District
                      </label>
                      <select
                        value={newOrg.orgn_district}
                        onChange={(e) => setNewOrg({ ...newOrg, orgn_district: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50"
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
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        Address 1
                      </label>
                      <input
                        placeholder="Street / Building"
                        value={newOrg.orgn_address1}
                        onChange={(e) => setNewOrg({ ...newOrg, orgn_address1: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm placeholder-gray-400 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        Address 2
                      </label>
                      <input
                        placeholder="Area / Locality"
                        value={newOrg.orgn_address2}
                        onChange={(e) => setNewOrg({ ...newOrg, orgn_address2: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm placeholder-gray-400 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        City / Place
                      </label>
                      <input
                        placeholder="City"
                        value={newOrg.orgn_place}
                        onChange={(e) => setNewOrg({ ...newOrg, orgn_place: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm placeholder-gray-400 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        Pincode *
                      </label>
                      <input
                        required
                        placeholder="6 digits"
                        pattern="[0-9]{6}"
                        title="Pincode must be 6 digits"
                        value={newOrg.orgn_pincode}
                        onChange={(e) => setNewOrg({ ...newOrg, orgn_pincode: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm placeholder-gray-400 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
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

                {/* List */}
                <div className="flex flex-col">
                  <h4 className="mb-3 text-sm font-bold text-gray-800">
                    Existing Organizations ({organizations.length})
                  </h4>
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
                        <div className="text-[11px] font-medium text-gray-400">
                          ID: {org.orgn_id}
                        </div>
                      </div>
                    ))}
                    {organizations.length === 0 && (
                      <p className="text-xs text-gray-400 italic">No organizations found.</p>
                    )}
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </div>
      )}

      {/* ── Feature Matrix Section ────────────────────────────────────────────── */}
      {activeTab === 'FEATURES' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="text-indigo-650 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 ring-4 ring-indigo-50/30">
                <Shield className="text-indigo-650 h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Feature Access Control</h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Manage which user roles have access to each feature of the application.
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveMatrix}
              disabled={isSavingMatrix}
              className="bg-indigo-650 hover:shadow-indigo-150 flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
            >
              {isSavingMatrix ? 'Saving...' : 'Save Feature Matrix'}
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse divide-y divide-gray-200 text-left text-sm">
                <thead>
                  <tr className="bg-gray-50/70">
                    <th className="w-1/3 min-w-[280px] border-r border-gray-200 px-6 py-5 font-extrabold text-gray-700">
                      Feature / Privilege
                    </th>
                    {roles.map((role) => (
                      <th
                        key={role._id}
                        className="border-r border-gray-200 px-4 py-5 text-center font-bold"
                      >
                        <span
                          className={`inline-block rounded-full border px-3 py-1.5 text-xs font-bold tracking-wider uppercase ${getHeaderStyle(role.name)} shadow-sm`}
                        >
                          {role.name.replace(/_/g, ' ')}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-gray-150 divide-y">
                  {appFeatures.map((feat) => {
                    const privId = findPrivilegeId(feat.resource, feat.action);
                    return (
                      <tr key={feat.key} className="transition-colors hover:bg-gray-50/40">
                        <td className="border-r border-gray-200 px-6 py-4.5">
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-gray-900">{feat.name}</span>
                            <span className="mt-1 text-xs leading-relaxed font-medium text-gray-500">
                              {feat.description}
                            </span>
                          </div>
                        </td>
                        {roles.map((role) => {
                          const hasPriv = privId
                            ? (tempRolePrivileges[role._id] ?? []).includes(privId)
                            : false;
                          const isSuper = role.name.toLowerCase() === 'superadmin';
                          return (
                            <td
                              key={role._id}
                              className="border-r border-gray-200 px-4 py-4.5 text-center align-middle"
                            >
                              <div className="flex items-center justify-center">
                                <button
                                  type="button"
                                  disabled={isSuper || !privId}
                                  onClick={() =>
                                    privId && handleToggleMatrixPrivilege(role._id, privId)
                                  }
                                  className={`flex h-8 w-8 items-center justify-center rounded-xl border-2 transition-all duration-200 ${
                                    isSuper
                                      ? 'cursor-not-allowed border-indigo-200 bg-indigo-50/50 text-indigo-600 shadow-inner'
                                      : !privId
                                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-300'
                                        : hasPriv
                                          ? 'border-indigo-650 bg-indigo-650 scale-105 cursor-pointer text-white shadow-md shadow-indigo-100'
                                          : 'cursor-pointer border-gray-300 bg-white hover:border-indigo-500 hover:bg-indigo-50/30'
                                  }`}
                                  title={
                                    isSuper
                                      ? 'Superadmin has all bypass permissions'
                                      : `Toggle access for ${role.name}`
                                  }
                                >
                                  {hasPriv || isSuper ? (
                                    <Check className="h-4.5 w-4.5 stroke-[3.5px]" />
                                  ) : null}
                                </button>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Floating Modern Toast Notification */}
      {note && (
        <div
          className={`animate-slide-in fixed right-5 bottom-5 z-[9999] flex max-w-sm items-center gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-350 ${
            note.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-950/95 text-emerald-100'
              : 'border-rose-500/20 bg-rose-950/95 text-rose-100'
          }`}
          role="alert"
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              note.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {note.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 pr-2 text-sm leading-snug font-semibold">{note.msg}</div>
          <button
            onClick={dismiss}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Dismiss toast"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/axios';
import {
  Shield,
  Layers,
  Key,
  Users,
  Plus,
  ChevronDown,
  Check,
  AlertCircle,
  CheckCircle,
  Building2,
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

interface UserItem {
  _id: string;
  email: string;
  role_id: Role | null;
  createdAt: string;
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

  return { note, show };
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
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
          <Icon className="h-4 w-4 text-indigo-600" />
        </span>
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function ActionBadge({ action }: { action: string }) {
  const colours: Record<string, string> = {
    CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    READ: 'bg-blue-50 text-blue-700 border-blue-200',
    UPDATE: 'bg-amber-50 text-amber-700 border-amber-200',
    DELETE: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span
      className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${colours[action] ?? 'border-gray-200 bg-gray-50 text-gray-600'}`}
    >
      {action}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Admin() {
  const { note, show } = useNotification();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [resources, setResources] = useState<Resource[]>([]);
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);

  // ── Tab state ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'RBAC' | 'ORG'>('RBAC');

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

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.data.users);
    } catch {
      show('Failed to load users.', 'error');
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
    fetchUsers();
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

  async function handleUpdateUserRole(userId: string, roleId: string) {
    try {
      await api.put(`/users/${userId}/role`, { role_id: roleId });
      show('User role updated.');
      fetchUsers();
    } catch (err: unknown) {
      show(getErrMsg(err, 'Failed to update user role.'), 'error');
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

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage system configurations, access control, and organizations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`border-b-2 px-4 py-2 text-sm font-medium ${activeTab === 'RBAC' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
          onClick={() => setActiveTab('RBAC')}
        >
          RBAC Management
        </button>
        <button
          className={`border-b-2 px-4 py-2 text-sm font-medium ${activeTab === 'ORG' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
          onClick={() => setActiveTab('ORG')}
        >
          Organization Management
        </button>
      </div>

      {/* Toast notification */}
      {note && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
            note.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {note.type === 'success' ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {note.msg}
        </div>
      )}

      {/* ── RBAC Section ───────────────────────────────────────────────────── */}
      {activeTab === 'RBAC' && (
        <div className="rounded-xl border-2 border-indigo-100 bg-indigo-50/40 p-1">
          <div className="px-5 py-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-indigo-900">RBAC Management</h2>
            </div>
            <p className="mt-0.5 text-xs text-indigo-600">
              Create and assign resources, privileges, roles, and manage user access.
            </p>
          </div>

          <div className="space-y-4 p-2">
            {/* Resources */}
            <Section title="Resources" icon={Layers}>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Create form */}
                <form onSubmit={handleCreateResource} className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Create New Resource</h4>
                  <input
                    required
                    placeholder="Resource name (e.g. Program_Unit)"
                    value={newResource.name}
                    onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  />
                  <input
                    placeholder="Description (optional)"
                    value={newResource.description}
                    onChange={(e) =>
                      setNewResource({ ...newResource, description: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Create Resource
                  </button>
                </form>

                {/* List */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">
                    Existing Resources ({resources.length})
                  </h4>
                  <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                    {resources.map((r) => (
                      <div
                        key={r._id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-gray-800">{r.name}</span>
                        <span className="text-xs text-gray-400">{r.description ?? '—'}</span>
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
              <div className="grid gap-6 md:grid-cols-2">
                {/* Create form */}
                <form onSubmit={handleCreatePrivilege} className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Create New Privilege</h4>
                  <select
                    required
                    value={newPrivilege.resource}
                    onChange={(e) => setNewPrivilege({ ...newPrivilege, resource: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  >
                    <option value="">Select resource…</option>
                    {resources.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newPrivilege.action}
                    onChange={(e) => setNewPrivilege({ ...newPrivilege, action: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  >
                    {['CREATE', 'READ', 'UPDATE', 'DELETE'].map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Custom name (auto-generated if blank)"
                    value={newPrivilege.name}
                    onChange={(e) => setNewPrivilege({ ...newPrivilege, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  />
                  <input
                    placeholder="Description (optional)"
                    value={newPrivilege.description}
                    onChange={(e) =>
                      setNewPrivilege({ ...newPrivilege, description: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Create Privilege
                  </button>
                </form>

                {/* List */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">
                    Existing Privileges ({privileges.length})
                  </h4>
                  <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                    {privileges.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-gray-800">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{p.resource?.name ?? '—'}</span>
                          <ActionBadge action={p.action} />
                        </div>
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
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Create role */}
                <form onSubmit={handleCreateRole} className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Create New Role</h4>
                  <input
                    required
                    placeholder="Role name (e.g. Finance_Head)"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  />
                  <input
                    placeholder="Description (optional)"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Create Role
                  </button>
                </form>

                {/* Assign privileges to a role */}
                <div className="space-y-3 lg:col-span-2">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Assign / Remove Permissions
                  </h4>

                  {/* Role selector */}
                  <div className="relative">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 pr-8 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                    >
                      <option value="">Choose a role…</option>
                      {roles.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-2.5 right-2.5 h-4 w-4 text-gray-400" />
                  </div>

                  {/* Privilege checkboxes */}
                  {selectedRole && (
                    <>
                      <div className="grid max-h-48 grid-cols-2 gap-1.5 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-3">
                        {privileges.map((p) => {
                          const checked = selectedPrivileges.includes(p._id);
                          return (
                            <label
                              key={p._id}
                              className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-xs transition-colors ${
                                checked
                                  ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              <div
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                  checked
                                    ? 'border-indigo-500 bg-indigo-600'
                                    : 'border-gray-300 bg-white'
                                }`}
                                onClick={() => togglePrivilege(p._id)}
                              >
                                {checked && <Check className="h-2.5 w-2.5 text-white" />}
                              </div>
                              <span className="leading-tight">{p.name}</span>
                            </label>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {selectedPrivileges.length} of {privileges.length} selected
                        </p>
                        <button
                          type="button"
                          onClick={handleSaveRolePrivileges}
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                        >
                          Save Permissions
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Roles overview table */}
              <div className="mt-6 overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Permissions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {roles.map((role) => (
                      <tr key={role._id} className="hover:bg-gray-50/60">
                        <td className="px-4 py-3 font-medium text-gray-800">{role.name}</td>
                        <td className="px-4 py-3 text-gray-500">{role.description ?? '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {role.privileges.length === 0 ? (
                              <span className="text-xs text-gray-400 italic">None</span>
                            ) : (
                              role.privileges.slice(0, 6).map((p) => (
                                <span
                                  key={p._id}
                                  className="rounded border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700"
                                >
                                  {p.name}
                                </span>
                              ))
                            )}
                            {role.privileges.length > 6 && (
                              <span className="text-[10px] text-gray-400">
                                +{role.privileges.length - 6} more
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

            {/* User-Role Assignment */}
            <Section title="User Management" icon={Users}>
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Current Role</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3">Change Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50/60">
                        <td className="px-4 py-3 font-medium text-gray-800">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                            {u.role_id?.name ?? 'None'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative inline-block">
                            <select
                              value={u.role_id?._id ?? ''}
                              onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                              className="appearance-none rounded-lg border border-gray-200 bg-white px-3 py-1.5 pr-7 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                            >
                              {roles.map((r) => (
                                <option key={r._id} value={r._id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute top-2 right-2 h-3 w-3 text-gray-400" />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-center text-xs text-gray-400 italic"
                        >
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        </div>
      )}

      {/* ── Organization Section ────────────────────────────────────────────── */}
      {activeTab === 'ORG' && (
        <div className="rounded-xl border-2 border-indigo-100 bg-indigo-50/40 p-1">
          <div className="px-5 py-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-indigo-900">Organization Management</h2>
            </div>
            <p className="mt-0.5 text-xs text-indigo-600">
              Create and manage organizations (Program Units, NSS, PMU, etc).
            </p>
          </div>

          <div className="space-y-4 p-2">
            <Section title="Organizations" icon={Building2}>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Create form */}
                <form onSubmit={handleCreateOrganization} className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Create New Organization</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required
                      placeholder="Organization ID"
                      value={newOrg.orgn_id}
                      onChange={(e) => setNewOrg({ ...newOrg, orgn_id: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                    />
                    <select
                      required
                      value={newOrg.orgn_type}
                      onChange={(e) =>
                        setNewOrg({
                          ...newOrg,
                          orgn_type: e.target.value as CreateOrganizationPayload['orgn_type'],
                        })
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                    >
                      <option value="PU">Program Unit (PU)</option>
                      <option value="NSS">NSS</option>
                      <option value="PMU">PMU</option>
                      <option value="OTH">Other</option>
                    </select>
                  </div>

                  <input
                    required
                    placeholder="Organization Name"
                    value={newOrg.orgn_name}
                    onChange={(e) => setNewOrg({ ...newOrg, orgn_name: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      required
                      value={newOrg.orgn_state}
                      onChange={(e) =>
                        setNewOrg({ ...newOrg, orgn_state: e.target.value, orgn_district: '' })
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                    >
                      <option value="">Select State</option>
                      {states.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.state_name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newOrg.orgn_district}
                      onChange={(e) => setNewOrg({ ...newOrg, orgn_district: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
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

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Address 1"
                      value={newOrg.orgn_address1}
                      onChange={(e) => setNewOrg({ ...newOrg, orgn_address1: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                    />
                    <input
                      placeholder="Address 2"
                      value={newOrg.orgn_address2}
                      onChange={(e) => setNewOrg({ ...newOrg, orgn_address2: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Place / City"
                      value={newOrg.orgn_place}
                      onChange={(e) => setNewOrg({ ...newOrg, orgn_place: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                    />
                    <input
                      required
                      placeholder="Pincode"
                      pattern="[0-9]{6}"
                      title="Pincode must be 6 digits"
                      value={newOrg.orgn_pincode}
                      onChange={(e) => setNewOrg({ ...newOrg, orgn_pincode: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Create Organization
                  </button>
                </form>

                {/* List */}
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">
                    Existing Organizations ({organizations.length})
                  </h4>
                  <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
                    {organizations.map((org) => (
                      <div
                        key={org._id}
                        className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{org.orgn_name}</span>
                          <span className="rounded border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                            {org.orgn_type}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">ID: {org.orgn_id}</div>
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
    </div>
  );
}

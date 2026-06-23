import React, { useState, useEffect } from 'react';
import { Shield, Check, ChevronDown, Layers, Key, Plus } from 'lucide-react';
import { api } from '@/api/axios';
import { type Resource, type Privilege, type Role, type NotifyFn } from './types';
import { Section, ActionBadge, getErrMsg } from './shared';

interface Props {
  resources: Resource[];
  privileges: Privilege[];
  roles: Role[];
  onRefreshPrivileges: () => void;
  onRefreshRoles: () => void;
  onRefreshResources: () => void;
  notify: NotifyFn;
}

export function RBACManagement({
  resources,
  privileges,
  roles,
  onRefreshPrivileges,
  onRefreshRoles,
  onRefreshResources,
  notify,
}: Props) {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [newResource, setNewResource] = useState({ name: '', description: '' });
  const [newPrivilege, setNewPrivilege] = useState({
    name: '',
    resource: '',
    action: 'READ',
    description: '',
  });
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  // ── Role-privilege assignment ────────────────────────────────────────────────
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedRole) {
      setSelectedPrivileges([]);
      return;
    }
    const role = roles.find((r) => r._id === selectedRole);
    setSelectedPrivileges(role?.privileges.map((p) => p._id) ?? []);
  }, [selectedRole, roles]);

  function togglePrivilege(id: string) {
    setSelectedPrivileges((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────
  async function handleCreateResource(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/rbac/resources', newResource);
      setNewResource({ name: '', description: '' });
      notify('Resource created successfully.');
      onRefreshResources();
    } catch (err) {
      notify(getErrMsg(err, 'Failed to create resource.'), 'error');
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
      notify('Privilege created successfully.');
      onRefreshPrivileges();
    } catch (err) {
      notify(getErrMsg(err, 'Failed to create privilege.'), 'error');
    }
  }

  async function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/rbac/roles', newRole);
      setNewRole({ name: '', description: '' });
      notify('Role created successfully.');
      onRefreshRoles();
    } catch (err) {
      notify(getErrMsg(err, 'Failed to create role.'), 'error');
    }
  }

  async function handleSaveRolePrivileges() {
    if (!selectedRole) {
      notify('Please select a role first.', 'error');
      return;
    }
    try {
      await api.put(`/rbac/roles/${selectedRole}/privileges`, {
        privileges: selectedPrivileges,
      });
      notify('Permissions updated successfully.');
      onRefreshRoles();
    } catch (err) {
      notify(getErrMsg(err, 'Failed to update permissions.'), 'error');
    }
  }

  const inputCls =
    'w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3.5 py-2.5 text-sm placeholder-gray-400 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10';
  const labelCls = 'text-[10px] font-bold tracking-wider text-gray-400 uppercase';
  const btnCls =
    'hover:shadow-indigo-150 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]';

  return (
    <div className="space-y-6">
      {/* Header */}
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
        {/* ── Resources ── */}
        <Section title="Resources" icon={Layers}>
          <div className="grid gap-8 md:grid-cols-2">
            <form onSubmit={handleCreateResource} className="space-y-4">
              <h4 className="text-sm font-bold text-gray-800">Create New Resource</h4>
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className={labelCls}>Resource Name *</label>
                  <input
                    required
                    placeholder="e.g. Program_Unit"
                    value={newResource.name}
                    onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Description</label>
                  <input
                    placeholder="Describe what this resource represents"
                    value={newResource.description}
                    onChange={(e) =>
                      setNewResource({ ...newResource, description: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>
              <button type="submit" className={btnCls}>
                <Plus className="h-4 w-4" /> Create Resource
              </button>
            </form>

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

        {/* ── Privileges ── */}
        <Section title="Privileges" icon={Key}>
          <div className="grid gap-8 md:grid-cols-2">
            <form onSubmit={handleCreatePrivilege} className="space-y-4">
              <h4 className="text-sm font-bold text-gray-800">Create New Privilege</h4>
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className={labelCls}>Resource *</label>
                  <select
                    required
                    value={newPrivilege.resource}
                    onChange={(e) => setNewPrivilege({ ...newPrivilege, resource: e.target.value })}
                    className={inputCls}
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
                  <label className={labelCls}>Action *</label>
                  <select
                    value={newPrivilege.action}
                    onChange={(e) => setNewPrivilege({ ...newPrivilege, action: e.target.value })}
                    className={inputCls}
                  >
                    {['CREATE', 'READ', 'UPDATE', 'DELETE'].map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Custom Name</label>
                  <input
                    placeholder="Auto-generated if blank (e.g. READ_USER)"
                    value={newPrivilege.name}
                    onChange={(e) => setNewPrivilege({ ...newPrivilege, name: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Description</label>
                  <input
                    placeholder="Describe this privilege"
                    value={newPrivilege.description}
                    onChange={(e) =>
                      setNewPrivilege({ ...newPrivilege, description: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>
              <button type="submit" className={btnCls}>
                <Plus className="h-4 w-4" /> Create Privilege
              </button>
            </form>

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
                      <span className="mt-1 text-xs text-gray-500">{p.resource?.name ?? '—'}</span>
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

        {/* ── Roles & Permissions ── */}
        <Section title="Roles & Permissions" icon={Shield}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Create role */}
            <form onSubmit={handleCreateRole} className="space-y-4">
              <h4 className="text-sm font-bold text-gray-800">Create New Role</h4>
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className={labelCls}>Role Name *</label>
                  <input
                    required
                    placeholder="e.g. Finance_Head"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Description</label>
                  <input
                    placeholder="Describe the role responsibilities"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
              <button type="submit" className={btnCls}>
                <Plus className="h-4 w-4" /> Create Role
              </button>
            </form>

            {/* Assign privileges to a role */}
            <div className="space-y-4 lg:col-span-2">
              <h4 className="text-sm font-bold text-gray-800">Assign / Remove Permissions</h4>
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
  );
}

import { Shield, Check } from 'lucide-react';
import { type Role, type Privilege } from './types';

interface Props {
  roles: Role[];
  privileges: Privilege[];
  tempRolePrivileges: Record<string, string[]>;
  onToggle: (roleId: string, privilegeId: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

const APP_FEATURES = [
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
    key: 'rollout_update',
    name: 'Update Rollout Campaigns',
    resource: 'Rollout',
    action: 'UPDATE',
    description: 'Allows modifying existing rollout campaigns and templates.',
  },
  {
    key: 'rollout_delete',
    name: 'Delete Rollout Campaigns',
    resource: 'Rollout',
    action: 'DELETE',
    description: 'Allows deleting rollout campaigns and templates.',
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
    key: 'knowledge_update',
    name: 'Update Knowledge Base',
    resource: 'Mediacorner',
    action: 'UPDATE',
    description: 'Allows modifying documents and articles in the media portal.',
  },
  {
    key: 'knowledge_delete',
    name: 'Delete from Knowledge Base',
    resource: 'Mediacorner',
    action: 'DELETE',
    description: 'Allows removing documents and articles from the media portal.',
  },
  {
    key: 'rbac_view',
    name: 'View Administration & RBAC',
    resource: 'RBAC',
    action: 'READ',
    description: 'Allows access to the Admin tab to view system rules.',
  },
  {
    key: 'rbac_create',
    name: 'Create RBAC Policies',
    resource: 'RBAC',
    action: 'CREATE',
    description: 'Allows creating new roles and privileges.',
  },
  {
    key: 'rbac_manage',
    name: 'Manage System Features & RBAC',
    resource: 'RBAC',
    action: 'UPDATE',
    description: 'Allows assigning roles, editing privileges, and managing feature matrices.',
  },
  {
    key: 'rbac_delete',
    name: 'Delete RBAC Policies',
    resource: 'RBAC',
    action: 'DELETE',
    description: 'Allows deleting roles and privileges.',
  },
  {
    key: 'ticket_view',
    name: 'View Tickets',
    resource: 'Ticket',
    action: 'READ',
    description: 'Allows viewing existing tickets and feedback.',
  },
  {
    key: 'ticket_create',
    name: 'Create Tickets',
    resource: 'Ticket',
    action: 'CREATE',
    description: 'Allows creating new support tickets and feedback.',
  },
  {
    key: 'ticket_update',
    name: 'Update Tickets',
    resource: 'Ticket',
    action: 'UPDATE',
    description: 'Allows changing ticket status and updating ticket details.',
  },
  {
    key: 'ticket_delete',
    name: 'Delete Tickets',
    resource: 'Ticket',
    action: 'DELETE',
    description: 'Allows deleting support tickets.',
  },
];

const getHeaderStyle = (name: string) => {
  const norm = name.toLowerCase();
  if (norm.includes('superadmin')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (norm.includes('nss_admin')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (norm.includes('nss_user')) return 'bg-sky-50 text-sky-700 border-sky-200';
  if (norm.includes('coordinator') || norm.includes('prog'))
    return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

export function FeaturePermissions({
  roles,
  privileges,
  tempRolePrivileges,
  onToggle,
  onSave,
  isSaving,
}: Props) {
  const findPrivilegeId = (resourceName: string, actionName: string): string | undefined =>
    privileges.find(
      (p) =>
        p.resource?.name?.toLowerCase() === resourceName.toLowerCase() &&
        p.action?.toUpperCase() === actionName.toUpperCase(),
    )?._id;

  return (
    <div className="space-y-6">
      {/* Header - More Prominent Save Button */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50/30">
            <Shield className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Feature Access Control</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Manage which user roles have access to each feature of the application.
            </p>
          </div>
        </div>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            <>Saving Changes...</>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save Feature Matrix
            </>
          )}
        </button>
      </div>

      {/* Feature Matrix Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse divide-y divide-gray-200 text-left text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="w-1/3 min-w-[280px] border-r border-gray-200 px-6 py-5 font-extrabold text-gray-700">
                  Feature / Privilege
                </th>
                {roles.map((role) => (
                  <th
                    key={role._id}
                    className="border-r border-gray-200 px-4 py-5 text-center font-bold"
                  >
                    <span
                      className={`inline-block rounded-full border px-4 py-1.5 text-xs font-bold tracking-wider uppercase shadow-sm ${getHeaderStyle(role.name)}`}
                    >
                      {role.name.replace(/_/g, ' ')}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {APP_FEATURES.map((feat) => {
                const privId = findPrivilegeId(feat.resource, feat.action);
                return (
                  <tr key={feat.key} className="transition-colors hover:bg-gray-50">
                    <td className="border-r border-gray-200 px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-semibold text-gray-900">{feat.name}</span>
                        <span className="mt-1 text-xs leading-relaxed text-gray-500">
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
                          className="border-r border-gray-200 px-6 py-5 text-center"
                        >
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              disabled={isSuper || !privId}
                              onClick={() => privId && onToggle(role._id, privId)}
                              className={`group flex h-9 w-9 items-center justify-center rounded-2xl border-2 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none ${
                                isSuper
                                  ? 'cursor-not-allowed border-indigo-200 bg-indigo-50 text-indigo-600'
                                  : !privId
                                    ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-300'
                                    : hasPriv
                                      ? 'scale-105 border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                      : 'border-gray-300 bg-white hover:border-indigo-500 hover:bg-indigo-50 active:scale-95'
                              }`}
                              title={
                                isSuper
                                  ? 'Superadmin has all permissions'
                                  : `Toggle ${feat.name} for ${role.name}`
                              }
                            >
                              {(hasPriv || isSuper) && <Check className="h-5 w-5 stroke-[3px]" />}
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
  );
}

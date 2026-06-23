import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/axios';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

import { type Resource, type Privilege, type Role } from '@/features/admin/types';
import { RBACManagement } from '@/features/admin/RBACManagement';
import { OrganizationManagement } from '@/features/admin/OrganizationManagement';
import { FeaturePermissions } from '@/features/admin/FeaturePermissions';
import { usePermission } from '@/context/auth/usePermission';

// ── Notification hook ─────────────────────────────────────────────────────────
function useNotification() {
  const [note, setNote] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const show = (msg: string, type: 'success' | 'error' = 'success') => {
    setNote({ msg, type });
    setTimeout(() => setNote(null), 4000);
  };

  const dismiss = () => setNote(null);

  return { note, show, dismiss };
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Admin() {
  const { note, show, dismiss } = useNotification();
  const { hasPermission } = usePermission();

  // ── RBAC data state ──────────────────────────────────────────────────────────
  const [resources, setResources] = useState<Resource[]>([]);
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // ── Tab state ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'RBAC' | 'ORG' | 'FEATURES'>('FEATURES');

  // Set the first available tab if FEATURES is not available
  useEffect(() => {
    if (activeTab === 'FEATURES' && !hasPermission('RBAC', 'UPDATE')) {
      if (hasPermission('RBAC', 'READ')) setActiveTab('RBAC');
      else if (hasPermission('Program_Unit', 'READ')) setActiveTab('ORG');
    }
  }, [hasPermission, activeTab]);

  // ── Feature Matrix state ─────────────────────────────────────────────────────
  const [tempRolePrivileges, setTempRolePrivileges] = useState<Record<string, string[]>>({});
  const [isSavingMatrix, setIsSavingMatrix] = useState(false);

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
      show('Failed to save feature changes.', 'error');
    } else {
      show('No changes detected to save.');
    }
  };

  // ── Fetch helpers ─────────────────────────────────────────────────────────────
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

  useEffect(() => {
    fetchResources();
    fetchPrivileges();
    fetchRoles();
  }, []);

  // ── Tab button helper ─────────────────────────────────────────────────────────
  const tabs: { key: 'FEATURES' | 'RBAC' | 'ORG'; label: string }[] = [];
  if (hasPermission('RBAC', 'UPDATE')) {
    tabs.push({ key: 'FEATURES', label: 'Feature Permissions' });
  }
  if (hasPermission('RBAC', 'READ')) {
    tabs.push({ key: 'RBAC', label: 'RBAC Management' });
  }
  if (hasPermission('Program_Unit', 'READ')) {
    tabs.push({ key: 'ORG', label: 'Organization Management' });
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Animation keyframes */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
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
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            className={`relative pb-3 text-sm font-bold transition-all duration-205 ${
              activeTab === key ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={() => setActiveTab(key)}
          >
            {label}
            {activeTab === key && (
              <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-indigo-600" />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab panels ─────────────────────────────────────────────────────────── */}
      {activeTab === 'FEATURES' && (
        <FeaturePermissions
          roles={roles}
          privileges={privileges}
          tempRolePrivileges={tempRolePrivileges}
          onToggle={handleToggleMatrixPrivilege}
          onSave={handleSaveMatrix}
          isSaving={isSavingMatrix}
        />
      )}

      {activeTab === 'RBAC' && (
        <RBACManagement
          resources={resources}
          privileges={privileges}
          roles={roles}
          onRefreshResources={fetchResources}
          onRefreshPrivileges={fetchPrivileges}
          onRefreshRoles={fetchRoles}
          notify={show}
        />
      )}

      {activeTab === 'ORG' && <OrganizationManagement notify={show} />}

      {/* Toast notification */}
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

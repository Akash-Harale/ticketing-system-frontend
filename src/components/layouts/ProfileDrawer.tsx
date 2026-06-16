import React from 'react';
import {
  X,
  Mail,
  Phone,
  User as UserIcon,
  Building2,
  MapPin,
  Calendar,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { User } from '@/context/auth/AuthContext';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
}

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
      <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">{label}</p>
      <p className="mt-0.5 text-sm leading-snug font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

export const ProfileDrawer = ({ isOpen, onClose, user, onLogout }: ProfileDrawerProps) => {
  if (!user) return null;

  // Extract initials for the profile avatar
  const initials = user.member_id?.name
    ? user.member_id.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : user.email.charAt(0).toUpperCase();

  const fullName = user.member_id?.name || 'User Profile';
  const roleName = user.role_id?.name || '—';

  // Format joined date
  const joinedDateStr = user.member_id?.joinedAt || user.createdAt;
  const formattedJoinedDate = joinedDateStr
    ? new Date(joinedDateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  // Get state and district names cleanly
  const org = user.member_id?.organization || user.orgn_id;
  const getLocName = (
    locObj:
      | { _id: string; state_name?: string; district_name?: string }
      | string
      | null
      | undefined,
  ) => {
    if (!locObj) return '';
    return typeof locObj === 'object' ? locObj.state_name || locObj.district_name || '' : '';
  };
  const stateName = org ? getLocName(org.orgn_state) : '';
  const districtName = org ? getLocName(org.orgn_district) : '';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-drawer-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-6">
          <div className="flex min-w-0 items-center gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-base font-bold text-white shadow-lg">
              {initials}
            </div>
            <div className="min-w-0">
              <h2
                id="profile-drawer-title"
                className="truncate text-[15px] leading-snug font-bold text-gray-900"
              >
                {fullName}
              </h2>
              <p className="mt-0.5 truncate text-[13px] text-gray-500">{user.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
                <span
                  className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700"
                  id="profile-role-badge"
                >
                  {roleName}
                </span>
              </div>
            </div>
          </div>
          <button
            id="btn-close-profile-drawer"
            onClick={onClose}
            className="hover:text-gray-650 flex-shrink-0 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100"
            aria-label="Close profile details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3 className="mt-2 mb-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
            Personal Information
          </h3>
          <div className="mb-4 flex flex-col">
            <InfoRow icon={<UserIcon className="h-4 w-4" />} label="Full Name" value={fullName} />
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Email Address" value={user.email} />
            {user.member_id?.mobile && (
              <InfoRow
                icon={<Phone className="h-4 w-4" />}
                label="Phone Number"
                value={user.member_id.mobile}
              />
            )}
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Member Since"
              value={formattedJoinedDate}
            />
          </div>

          {org && (
            <>
              <h3 className="mt-4 mb-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
                Organization
              </h3>
              <div className="flex flex-col">
                <InfoRow
                  icon={<Building2 className="h-4 w-4" />}
                  label="Organization Name"
                  value={org.orgn_name}
                />
                <InfoRow
                  icon={<Building2 className="h-4 w-4" />}
                  label="Organization ID"
                  value={org.orgn_id}
                />
                {stateName && (
                  <InfoRow icon={<MapPin className="h-4 w-4" />} label="State" value={stateName} />
                )}
                {districtName && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="District"
                    value={districtName}
                  />
                )}
              </div>
            </>
          )}

          {/* Logout Action Button */}
          <div className="mt-8 mb-4">
            <button
              id="btn-profile-logout"
              onClick={onLogout}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-205 hover:bg-red-600 hover:shadow active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

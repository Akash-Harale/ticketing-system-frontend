import React from 'react';
import {
  X,
  Mail,
  Phone,
  Briefcase,
  User,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { UserItem } from '../data/userManagementData';

interface UserDetailDrawerProps {
  user: UserItem | null;
  onClose: () => void;
  onEditClick?: () => void;
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
  <div className="flex items-start gap-3 border-b border-gray-100 py-3 last:border-0">
    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">{label}</p>
      <p className="mt-0.5 text-sm text-gray-800">{value}</p>
    </div>
  </div>
);

export const UserDetailDrawer = ({ user, onClose, onEditClick }: UserDetailDrawerProps) => {
  if (!user) return null;

  const statusClass =
    user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-drawer-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            {/* Avatar */}
            <div
              className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${user.avatarColor} text-base font-bold text-white shadow-lg`}
            >
              {user.avatarInitials}
            </div>
            <div className="min-w-0">
              <h2
                id="user-drawer-title"
                className="truncate text-[15px] leading-snug font-bold text-gray-900"
              >
                {user.name}
              </h2>
              <p className="mt-0.5 truncate text-[13px] text-gray-500">{user.designation}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}
                >
                  {user.status === 'Active' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {user.status}
                </span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          <button
            id="user-drawer-close"
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close user details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email Address" value={user.email} />
          <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone Number" value={user.phone} />
          <InfoRow
            icon={<Briefcase className="h-4 w-4" />}
            label="Designation"
            value={user.designation}
          />
          <InfoRow
            icon={<Building2 className="h-4 w-4" />}
            label="Department"
            value={user.department}
          />
          <InfoRow icon={<User className="h-4 w-4" />} label="Gender" value={user.gender} />
          {user.state && (
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="State" value={user.state} />
          )}
          {user.district && (
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="District" value={user.district} />
          )}
          <InfoRow
            icon={<Calendar className="h-4 w-4" />}
            label="Joined Date"
            value={user.joinedDate}
          />

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex gap-3">
              <a
                href={`tel:${user.phone}`}
                id={`user-call-${user.id}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
              <a
                href={`mailto:${user.email}`}
                id={`user-email-${user.id}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>
            {onEditClick && (
              <button
                id={`user-edit-${user.id}`}
                onClick={onEditClick}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Edit User Details
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

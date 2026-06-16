import React, { useState } from 'react';
import { X, Building2, MapPin, Calendar, Users, Phone, Mail, Briefcase, User } from 'lucide-react';
import { ProgramUnitItem } from '../data/programUnitData';
import { Tab, TabItem } from '../../../components/ui/Tab';

interface ProgramUnitDetailDrawerProps {
  unit: ProgramUnitItem | null;
  onClose: () => void;
}

const DETAIL_TABS: TabItem[] = [
  { id: 'unit', label: 'Program Unit Details', icon: <Building2 className="h-4 w-4" /> },
  { id: 'coordinator', label: 'Coordinator Details', icon: <User className="h-4 w-4" /> },
];

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
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

export const ProgramUnitDetailDrawer = ({ unit, onClose }: ProgramUnitDetailDrawerProps) => {
  const [activeTab, setActiveTab] = useState('unit');

  if (!unit) return null;

  const statusClass =
    unit.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600';

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
        className="fixed top-0 right-0 z-50 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2
                id="drawer-title"
                className="line-clamp-2 text-[15px] leading-snug font-bold text-gray-900"
              >
                {unit.name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-gray-400">{unit.code}</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}
                >
                  {unit.status}
                </span>
              </div>
            </div>
          </div>
          <button
            id="drawer-close"
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close detail panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <Tab tabs={DETAIL_TABS} activeTab={activeTab} onTabChange={setActiveTab} className="px-4" />

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'unit' && (
            <div>
              <InfoRow
                icon={<Building2 className="h-4 w-4" />}
                label="College / Institution"
                value={unit.college}
              />
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="State" value={unit.state} />
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                label="District"
                value={unit.district}
              />
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                label="Full Address"
                value={unit.address}
              />
              <InfoRow
                icon={<Briefcase className="h-4 w-4" />}
                label="Unit Type"
                value={unit.type}
              />
              <InfoRow
                icon={<Users className="h-4 w-4" />}
                label="Volunteer Strength"
                value={`${unit.strength} volunteers`}
              />
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Established Year"
                value={unit.estYear}
              />
            </div>
          )}

          {activeTab === 'coordinator' && (
            <div>
              <InfoRow
                icon={<User className="h-4 w-4" />}
                label="Full Name"
                value={unit.coordinator.name}
              />
              <InfoRow
                icon={<Briefcase className="h-4 w-4" />}
                label="Designation"
                value={unit.coordinator.designation || ''}
              />
              <InfoRow
                icon={<Phone className="h-4 w-4" />}
                label="Phone Number"
                value={unit.coordinator.phone}
              />
              <InfoRow
                icon={<Mail className="h-4 w-4" />}
                label="Email ID"
                value={unit.coordinator.email}
              />

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <a
                  href={`tel:${unit.coordinator.phone}`}
                  id="coordinator-call"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
                <a
                  href={`mailto:${unit.coordinator.email}`}
                  id="coordinator-email"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

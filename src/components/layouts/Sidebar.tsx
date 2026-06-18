import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  GitBranch,
  BookOpen,
  ShieldCheck,
  Bell,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/auth/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
}

export const Sidebar = ({ isOpen, onClose, onProfileClick }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();

  const isCoordinator =
    user?.role_id?.name?.toLowerCase() === 'porgram_unit_coordinator' ||
    user?.role_id?.name?.toLowerCase() === 'program_unit_coordinator';

  const hasPermission = (resource: string, action: string) => {
    if (!user) return false;
    if (user.role_id?.name?.toLowerCase() === 'superadmin') return true;
    return user.role_id?.privileges?.some(
      (p) =>
        p.resource?.name?.toLowerCase() === resource.toLowerCase() &&
        p.action?.toUpperCase() === action.toUpperCase(),
    );
  };

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, visible: true },
    {
      label: 'Program Unit',
      to: '/program-unit',
      icon: Package,
      visible: hasPermission('Program_Unit', 'READ'),
    },
    {
      label: 'User Management',
      to: '/users',
      icon: Users,
      visible: hasPermission('Users', 'READ'),
    },
    {
      label: 'Rollout Management',
      to: '/rollout',
      icon: GitBranch,
      visible: hasPermission('Rollout', 'READ'),
    },
    {
      label: 'Knowledge Base',
      to: '/knowledge',
      icon: BookOpen,
      visible: hasPermission('Mediacorner', 'READ') || isCoordinator,
    },
    {
      label: 'Notification',
      to: '/notifications',
      icon: Bell,
      visible: true,
    },
    {
      label: 'Admin',
      to: '/admin',
      icon: ShieldCheck,
      visible: user?.role_id?.name?.toLowerCase() === 'superadmin',
    },
  ].filter((item) => item.visible);

  const initial = user?.email?.charAt(0).toUpperCase() ?? '?';

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-gray-800 bg-gray-950 transition-transform duration-300 ease-in-out md:top-[188px] md:z-30 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-gray-800 px-6 md:hidden">
          <Link to="/" className="flex cursor-pointer items-center justify-center py-2">
            <img src="./logo.png" alt="Company Logo" className="h-16 w-48 object-contain" />
          </Link>

          {/* Close Button for mobile */}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Label */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
            Main Menu
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {navItems.map(({ label, to, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-gray-400 hover:bg-gray-800/70 hover:text-gray-100'
                } `}
              >
                <Icon
                  className={`h-4 w-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                />
                <span>{label}</span>
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer — live user info */}
        <div className="border-t border-gray-800 px-4 py-4">
          <button
            id="btn-sidebar-profile"
            onClick={() => {
              onClose();
              onProfileClick();
            }}
            className="hover:bg-gray-850/40 group flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-50/20 text-xs font-semibold text-indigo-400 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-gray-200 transition-colors group-hover:text-white">
                {user?.email ?? '—'}
              </p>
              <p className="text-gray-550 truncate text-[11px]">{user?.role_id?.name ?? '—'}</p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

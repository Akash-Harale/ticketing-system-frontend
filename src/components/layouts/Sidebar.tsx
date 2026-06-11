import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  GitBranch,
  BookOpen,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import { useAuth } from '@/context/auth/useAuth';

const baseNavItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Program Unit', to: '/program-unit', icon: Package },
  { label: 'User Management', to: '/users', icon: Users },
  { label: 'Rollout Management', to: '/rollout', icon: GitBranch },
  { label: 'Knowledge Base', to: '/knowledge', icon: BookOpen },
];

const adminNavItem = { label: 'Admin', to: '/admin', icon: ShieldCheck };

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isSuperadmin = user?.role_id?.name === 'Superadmin';
  const navItems = isSuperadmin ? [...baseNavItems, adminNavItem] : baseNavItems;

  const initial = user?.email?.charAt(0).toUpperCase() ?? '?';

  return (
    <aside className="fixed top-0 left-0 flex h-screen w-64 flex-col border-r border-gray-800 bg-gray-950">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-gray-800 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <Ticket className="h-4 w-4 text-white" />
        </div>
        <span className="text-[15px] font-semibold tracking-wide text-white">NSS Portal</span>
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
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/20 text-xs font-semibold text-indigo-400">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-gray-200">{user?.email ?? '—'}</p>
            <p className="truncate text-[11px] text-gray-500">{user?.role_id?.name ?? '—'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

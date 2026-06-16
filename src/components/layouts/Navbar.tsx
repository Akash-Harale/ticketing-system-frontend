import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ProfileMenu } from './ProfileMenu';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/program-unit': 'Program Unit',
  '/users': 'User Management',
  '/rollout': 'Rollout Management',
  '/knowledge': 'Knowledge Base',
  '/admin': 'Admin',
};

interface NavbarProps {
  onMenuClick: () => void;
  onProfileClick: () => void;
}

export const Navbar = ({ onMenuClick, onProfileClick }: NavbarProps) => {
  const { pathname } = useLocation();

  // Match exact path first, then try prefix match for nested routes
  const pageTitle =
    pageTitles[pathname] ??
    Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] ??
    'Dashboard';

  return (
    <header className="fixed top-0 right-0 left-0 z-30 h-16 border-b bg-white px-4 md:left-64 md:px-6">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button */}
          <button
            onClick={onMenuClick}
            className="text-gray-505 flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 focus:outline-none md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">{pageTitle}</h2>
        </div>

        <ProfileMenu onProfileClick={onProfileClick} />
      </div>
    </header>
  );
};

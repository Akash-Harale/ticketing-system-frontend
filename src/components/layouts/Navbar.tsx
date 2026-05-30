import { useLocation } from 'react-router-dom';
import { ProfileMenu } from './ProfileMenu';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/program-unit': 'Program Unit',
  '/users': 'User Management',
  '/rollout': 'Rollout Management',
  '/knowledge': 'Knowledge Base',
  '/admin': 'Admin',
};

export const Navbar = () => {
  const { pathname } = useLocation();

  // Match exact path first, then try prefix match for nested routes
  const pageTitle =
    pageTitles[pathname] ??
    Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] ??
    'Dashboard';

  return (
    <header className="fixed top-0 right-0 left-64 z-40 h-16 border-b bg-white px-6">
      <div className="flex h-full items-center justify-between">
        <h2 className="text-lg font-semibold">{pageTitle}</h2>

        <ProfileMenu />
      </div>
    </header>
  );
};

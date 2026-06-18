import { Link } from 'react-router-dom';
import { useAuth } from '@/context/auth/useAuth';
import { Menu } from 'lucide-react';
import { ProfileMenu } from './ProfileMenu';

interface HeaderProps {
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}

export const Header = ({ onMenuClick, onProfileClick }: HeaderProps) => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-0 z-40 w-full bg-white font-sans shadow-sm">
      {/* Logo Section */}
      <div className="relative bg-white">
        <div className="mx-auto flex h-34 max-w-[1400px] items-center justify-between px-4 py-0">
          <div className="flex items-center">
            <Link to="/">
              <img
                src="https://nss.gov.in/sites/all/themes/youthaffair/logo.png"
                alt="NSS Logo"
                className="h-34 object-contain"
              />
            </Link>
          </div>

          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight whitespace-nowrap text-[#2d348f] md:text-3xl lg:text-4xl">
              NSS MIS Tools
            </h1>
          </div>

          <div>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyIgiUYbCOlOhfeQeBj4mxI5Og0uFKJdfI3A&s"
              alt="Swachh Bharat"
              className="h-24 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#2d348f]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4">
          <div className="flex items-center">
            {/* Hamburger Menu Button */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-[#ef4a24] focus:outline-none md:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <Link
              to="/"
              className="px-5 py-4 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-[#ef4a24]"
            >
              HOME
            </Link>
          </div>

          {/* Right Side: LOGIN / DASHBOARD */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="bg-green-600 px-6 py-4 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-green-700"
                >
                  DASHBOARD
                </Link>
                {onProfileClick && <ProfileMenu onProfileClick={onProfileClick} />}
              </>
            ) : (
              <Link
                to="/login"
                className="bg-green-600 px-6 py-4 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-green-700"
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

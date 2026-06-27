import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/auth/useAuth';
import { Menu, Bell } from 'lucide-react';
import { ProfileMenu } from './ProfileMenu';
import { api } from '@/api/axios';

interface HeaderProps {
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}

export const Header = ({ onMenuClick, onProfileClick }: HeaderProps) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      if (!isAuthenticated) return;
      const response = await api.get('/mediacorner', {
        params: { media_type: 'notification' },
      });
      const items = response.data.data || [];
      const unreadOneToOne = items.filter(
        (item: { notification_type: string; is_read?: boolean }) =>
          item.notification_type === 'one-to-one' && !item.is_read,
      );
      setUnreadCount(unreadOneToOne.length);
    } catch (error) {
      console.error('Failed to fetch unread notifications count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    window.addEventListener('notifications_read', fetchUnreadCount);
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => {
      window.removeEventListener('notifications_read', fetchUnreadCount);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  return (
    <header className="fixed top-0 right-0 left-0 z-40 w-full bg-white font-sans shadow-sm">
      {/* Logo Section */}
      <div className="relative bg-white">
        <div className="mx-auto flex h-34 max-w-[1400px] items-center justify-between px-4 py-0">
          <div className="flex items-center">
            <Link to="/">
              <img src="logo.png" alt="NSS Logo" className="h-34 object-contain" />
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
                  to="/notifications"
                  className="relative flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-[#ef4a24]/85 focus:outline-none"
                  aria-label="View notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#2d348f]">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/dashboard"
                  className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-[#ef4a24]/85"
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

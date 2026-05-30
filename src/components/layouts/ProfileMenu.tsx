import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth/useAuth';

export const ProfileMenu = () => {
  const [open, setOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get first letter and make it uppercase
  const getInitial = (email?: string) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {getInitial(user?.email)}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border bg-white shadow-lg z-50">
          <div className="border-b p-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-2xl">
              {getInitial(user?.email)}
            </div>
            <div>
              <p className="font-medium">{user?.email}</p>
              <p className="text-sm text-gray-500">{user?.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
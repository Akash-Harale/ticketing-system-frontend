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
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {getInitial(user?.email)}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg border bg-white shadow-lg">
          <div className="flex items-center gap-3 border-b p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-2xl font-semibold text-white">
              {getInitial(user?.email)}
            </div>
            <div>
              <p className="font-medium">{user?.email}</p>
              <p className="text-sm text-gray-500">{user?.role_id?.name}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left text-red-600 hover:bg-gray-100 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

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

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="rounded-lg border px-4 py-2">
        {user?.email}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border bg-white shadow-lg">
          <div className="border-b p-4">
            <p className="font-medium">{user?.email}</p>
            <p className="text-sm text-gray-500">{user?.role}</p>
          </div>

          <button onClick={handleLogout} className="w-full px-4 py-3 text-left hover:bg-gray-100">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

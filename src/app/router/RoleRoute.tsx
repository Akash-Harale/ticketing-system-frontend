import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/auth/useAuth';
import Unauthorized from '@/pages/Unauthorized';

interface RoleRouteProps {
  roles: string[];
}

export const RoleRoute = ({ roles }: RoleRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  // User is logged in but doesn't have the required role → show 403 page
  if (!user || !roles.includes(user.role)) {
    return <Unauthorized />;
  }

  return <Outlet />;
};

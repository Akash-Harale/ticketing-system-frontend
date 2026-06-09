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

  // Check role_id.name against the allowed roles list
  if (!user || !roles.includes(user.role_id?.name)) {
    return <Unauthorized />;
  }

  return <Outlet />;
};

import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/auth/useAuth';
import Unauthorized from '@/pages/Unauthorized';

interface PermissionRouteProps {
  resource: string;
  action: string;
}

export const PermissionRoute = ({ resource, action }: PermissionRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Unauthorized />;
  }

  // Bypass for Superadmin
  if (user.role_id?.name === 'Superadmin') {
    return <Outlet />;
  }

  const hasPermission = user.role_id?.privileges?.some(
    (p) =>
      p.resource?.name?.toLowerCase() === resource.toLowerCase() &&
      p.action?.toUpperCase() === action.toUpperCase(),
  );

  if (!hasPermission) {
    return <Unauthorized />;
  }

  return <Outlet />;
};

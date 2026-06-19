import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/auth/useAuth';
import Unauthorized from '@/pages/Unauthorized';

interface PermissionRouteProps {
  resource: string;
  action: string;
  requireSuperadmin?: boolean;
}

export const PermissionRoute = ({ resource, action, requireSuperadmin }: PermissionRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Unauthorized />;
  }

  if (requireSuperadmin) {
    if (user.role_id?.name?.toLowerCase() === 'superadmin') {
      return <Outlet />;
    }
    return <Unauthorized />;
  }

  const isCoordinator =
    user.role_id?.name?.toLowerCase() === 'porgram_unit_coordinator' ||
    user.role_id?.name?.toLowerCase() === 'program_unit_coordinator';

  const hasPermission =
    user.role_id?.privileges?.some(
      (p) =>
        p.resource?.name?.toLowerCase() === resource.toLowerCase() &&
        p.action?.toUpperCase() === action.toUpperCase(),
    ) ||
    (isCoordinator && resource.toLowerCase() === 'mediacorner' && action.toUpperCase() === 'READ');

  if (!hasPermission) {
    return <Unauthorized />;
  }

  return <Outlet />;
};

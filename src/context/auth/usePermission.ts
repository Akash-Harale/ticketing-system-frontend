import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function usePermission() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('usePermission must be used within an AuthProvider');
  }

  const { user } = context;

  const hasPermission = (resourceName: string, actionName: string): boolean => {
    if (!user || !user.role_id || !user.role_id.privileges) {
      return false;
    }

    // Superadmin bypass
    if (user.role_id.name.toLowerCase() === 'superadmin') {
      return true;
    }

    return user.role_id.privileges.some(
      (p) =>
        p.resource?.name?.toLowerCase() === resourceName.toLowerCase() &&
        p.action?.toUpperCase() === actionName.toUpperCase(),
    );
  };

  return { hasPermission };
}

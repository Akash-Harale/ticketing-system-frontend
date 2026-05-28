import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/auth/useAuth';

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

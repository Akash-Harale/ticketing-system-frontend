import { ReactNode, useEffect, useState } from 'react';
import { AuthContext, User } from './AuthContext';
import { authService } from '@/services/auth.service';

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const loadUser = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      // Token is invalid / expired — clear everything
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import { api } from '@/api/axios';
import { User } from '@/context/auth/AuthContext';

// Matches the new backend login/refresh response shape:
// { status, token, refreshToken, data: { user } }
export interface AuthResponse {
  status: string;
  token: string;
  refreshToken: string;
  data: {
    user: User;
  };
}

// Matches the new backend /auth/me response shape:
// { status, data: { user } }
interface ProfileResponse {
  status: string;
  data: {
    user: User;
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data;
  },

  getProfile: async (): Promise<User> => {
    const { data } = await api.get<ProfileResponse>('/auth/me');
    return data.data.user;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

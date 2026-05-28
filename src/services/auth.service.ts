import { api } from '@/api/axios';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('token');
  },
};

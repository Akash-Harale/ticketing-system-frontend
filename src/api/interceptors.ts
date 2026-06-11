import { api } from './axios';
import { authService } from '@/services/auth.service';

let isRefreshing = false;
// Queue of requests that arrived while a token refresh was in flight
let pendingQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

const flushQueue = (token: string | null, error: unknown = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
};

export const setupInterceptors = (onUnauthorized: () => void) => {
  // ── Request: attach access token ──────────────────────────────────────────
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  // ── Response: handle auth errors ─────────────────────────────────────────
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;
      const serverMessage: string =
        error.response?.data?.message ?? 'An unexpected error occurred.';

      // ── 401 Unauthorized: try to refresh ─────────────────────────────────
      if (status === 401 && !originalRequest._retry) {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // No refresh token — force logout immediately
          onUnauthorized();
          return Promise.reject(new Error(serverMessage));
        }

        if (isRefreshing) {
          // Another refresh is already in flight — queue this request
          return new Promise((resolve, reject) => {
            pendingQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const data = await authService.refresh(refreshToken);

          // New backend returns { token, refreshToken }
          localStorage.setItem('accessToken', data.token);
          localStorage.setItem('refreshToken', data.refreshToken);

          flushQueue(data.token);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;

          return api(originalRequest);
        } catch (refreshError) {
          // Refresh itself failed — clear tokens and redirect to login
          flushQueue(null, refreshError);
          authService.logout();
          onUnauthorized();
          return Promise.reject(new Error('Session expired. Please log in again.'));
        } finally {
          isRefreshing = false;
        }
      }

      // ── 403 Forbidden: not authorized for this action ─────────────────────
      if (status === 403) {
        return Promise.reject(
          new Error(serverMessage || 'You are not authorized to perform this action.'),
        );
      }

      // ── All other errors: forward the server message ──────────────────────
      return Promise.reject(new Error(serverMessage));
    },
  );
};

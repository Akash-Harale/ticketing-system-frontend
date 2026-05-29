import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';
import { setupInterceptors } from '@/api/interceptors';
import { authService } from '@/services/auth.service';

/**
 * When a 401 comes back and the refresh also fails, clear tokens and
 * redirect to login. We use window.location so this works outside React
 * (the interceptor has no access to React Router's navigate).
 */
setupInterceptors(() => {
  authService.logout();
  window.location.href = '/login';
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </React.StrictMode>,
);

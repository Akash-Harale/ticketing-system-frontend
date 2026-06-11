import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Admin from '@/pages/Admin';

import { MainLayout } from '@/components/layouts/MainLayout';
import { AuthLayout } from '@/components/layouts/AuthLayout';

import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ProgramUnit } from '@/pages/ProgramUnit';
import { Users } from '@/pages/Users';
import { Rollout } from '@/pages/Rollout';
import { Knowledge } from '@/pages/Knowledge';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected — all authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/program-unit" element={<ProgramUnit />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/rollout" element={<Rollout />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/knowledge" element={<Knowledge />} />
          </Route>
        </Route>

        {/* Protected — Superadmin only */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute roles={['Superadmin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

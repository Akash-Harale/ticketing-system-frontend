import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Admin from '@/pages/Admin';

import { MainLayout } from '@/components/layouts/MainLayout';

import { ProtectedRoute } from './ProtectedRoute';
import { PermissionRoute } from './PermissionRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ProgramUnit } from '@/pages/ProgramUnit';
import { Users } from '@/pages/Users';
import { Rollout } from '@/pages/Rollout';
import { CreateRollout } from '@/pages/CreateRollout';
import { Knowledge } from '@/pages/Knowledge';
import { Notifications } from '@/pages/Notifications';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Dashboard: All authenticated users */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Notifications: All authenticated users */}
            <Route path="/notifications" element={<Notifications />} />

            {/* Program Unit */}
            <Route element={<PermissionRoute resource="Program_Unit" action="READ" />}>
              <Route path="/program-unit" element={<ProgramUnit />} />
            </Route>

            {/* User Management */}
            <Route element={<PermissionRoute resource="Users" action="READ" />}>
              <Route path="/users" element={<Users />} />
            </Route>

            {/* Rollout Management */}
            <Route element={<PermissionRoute resource="Rollout" action="READ" />}>
              <Route path="/rollout" element={<Rollout />} />
              <Route path="/rollout/create" element={<CreateRollout />} />
            </Route>

            {/* Knowledge Base */}
            <Route element={<PermissionRoute resource="Mediacorner" action="READ" />}>
              <Route path="/knowledge" element={<Knowledge />} />
            </Route>

            {/* Admin (RBAC Management) */}
            <Route
              element={<PermissionRoute resource="RBAC" action="READ" requireSuperadmin={true} />}
            >
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

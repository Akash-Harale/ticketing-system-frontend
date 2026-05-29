import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const DashboardLayout = () => {
  return (
    <div>
      <Sidebar />
      <Navbar />

      <main className="mt-16 ml-64 min-h-screen bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
};

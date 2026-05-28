import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
  return (
    <div className="container-app py-8">
      <Outlet />
    </div>
  );
};

import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex flex-1 flex-col pt-[188px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

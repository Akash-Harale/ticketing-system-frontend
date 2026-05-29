import { ProfileMenu } from './ProfileMenu';

export const Navbar = () => {
  return (
    <header className="fixed top-0 right-0 left-64 z-40 h-16 border-b bg-white px-6">
      <div className="flex h-full items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard</h2>

        <ProfileMenu />
      </div>
    </header>
  );
};

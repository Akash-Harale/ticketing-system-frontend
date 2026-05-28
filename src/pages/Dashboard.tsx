import { useAuth } from '@/context/auth/useAuth';

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>

      <button className="btn-primary" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

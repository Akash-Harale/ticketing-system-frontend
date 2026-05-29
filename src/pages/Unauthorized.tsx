import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth/useAuth';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div
      className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center"
      role="main"
    >
      {/* Icon */}
      <div
        aria-hidden="true"
        className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-10 w-10"
        >
          <path
            fillRule="evenodd"
            d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Copy */}
      <div className="space-y-2">
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm">
          {user
            ? `Your account (${user.role}) does not have permission to view this page.`
            : 'You must be logged in with the appropriate role to access this page.'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          id="btn-go-back"
          onClick={() => navigate(-1)}
          className="border-border hover:bg-muted rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
        >
          Go Back
        </button>
        <button
          id="btn-go-home"
          onClick={() => navigate('/')}
          className="text-primary-foreground rounded-lg bg-primary px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

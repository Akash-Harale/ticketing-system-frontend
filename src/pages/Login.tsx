import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation before hitting the network
    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      // Surface the server's message (set by the interceptor) or a safe fallback
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      id="login-form"
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-xl border p-8 shadow"
      noValidate
    >
      <h1 className="mb-6 text-2xl font-bold">Login</h1>

      {/* Error banner — visible only when there is an error */}
      {error && (
        <div
          id="login-error"
          role="alert"
          aria-live="assertive"
          className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400"
        >
          {/* Lock / warning icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <Input
        id="input-email"
        label="Email"
        type="email"
        value={form.email}
        autoComplete="email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <Input
        id="input-password"
        label="Password"
        type="password"
        value={form.password}
        autoComplete="current-password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <Button id="btn-sign-in" loading={loading} type="submit">
        Sign In
      </Button>
    </form>
  );
}

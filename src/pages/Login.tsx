import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth/useAuth';
import { Award, Users, Heart, ArrowLeft, Shield } from 'lucide-react';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // View state: 'login' | 'forgot-password'
  const [view, setView] = useState<'login' | 'forgot-password'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotSuccess('');

    if (!forgotEmail.trim()) {
      return;
    }

    setForgotLoading(true);
    // Simulate sending a reset link with a timeout
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess('A password reset link has been sent to your registered email address.');
      setForgotEmail('');
    }, 1200);
  };

  return (
    <div className="flex flex-grow items-center justify-center bg-slate-50 px-4 py-4 md:px-8">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl md:flex-row">
        {/* Left Side: Rich NSS Brand Info */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-[#2d348f] via-[#21277a] to-[#121652] p-12 text-white md:flex md:w-1/2">
          {/* Subtle background glow decorative elements */}
          <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden rounded-l-2xl">
            <div className="absolute top-[-20%] left-[-20%] h-[80%] w-[80%] rounded-full bg-blue-500/10 blur-3xl"></div>
            <div className="absolute right-[-20%] bottom-[-20%] h-[80%] w-[80%] rounded-full bg-[#ef4a24]/15 blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[#ef4a24] p-2.5 text-white shadow-md">
                <Shield className="h-6 w-6" />
              </span>
              <span className="text-lg font-bold tracking-wider">NSS PORTAL</span>
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-3xl leading-tight font-extrabold tracking-tight">
                National Service Scheme
              </h2>
            </div>

            {/* Core Values / Stats */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:bg-white/10">
                <div className="rounded-lg bg-yellow-400/10 p-2 text-yellow-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">3.8 Million+ Volunteers</h4>
                  <p className="text-xs text-slate-400">
                    Engaged in active community welfare projects
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:bg-white/10">
                <div className="rounded-lg bg-rose-400/10 p-2 text-rose-400">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Voluntary Community Service</h4>
                  <p className="text-xs text-slate-400">
                    Fostering empathy and social responsibility
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:bg-white/10">
                <div className="rounded-lg bg-[#ef4a24]/20 p-2 text-[#ef4a24]">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Character Development</h4>
                  <p className="text-xs text-slate-400">
                    Building leaders of tomorrow through service
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info of Left Side */}
          <div className="relative z-10 mt-8 flex flex-col gap-1 border-t border-white/10 pt-8 text-[11px] text-slate-400">
            <p className="font-medium text-slate-300">Ministry of Youth Affairs & Sports</p>
            <p>Government of India</p>
          </div>
        </div>

        {/* Right Side: Form (Login / Forgot Password) */}
        <div className="flex w-full flex-col justify-center bg-white p-8 md:w-1/2 md:p-12">
          {view === 'login' ? (
            <form id="login-form" onSubmit={handleSubmit} className="w-full space-y-5" noValidate>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-800">Welcome Back</h3>
                <p className="text-sm text-slate-500">Sign in to manage your NSS account</p>
              </div>

              {/* Error banner */}
              {error && (
                <div
                  id="login-error"
                  role="alert"
                  aria-live="assertive"
                  className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
                >
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

              <div className="space-y-4">
                <Input
                  id="input-email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  autoComplete="email"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <Input
                  id="input-password"
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  autoComplete="current-password"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-[#2d348f] focus:ring-[#2d348f]"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setView('forgot-password')}
                  className="cursor-pointer font-semibold text-[#2d348f] transition-colors hover:text-[#ef4a24] focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>

              <Button id="btn-sign-in" loading={loading} type="submit">
                Sign In
              </Button>
            </form>
          ) : (
            <form
              id="forgot-password-form"
              onSubmit={handleForgotPasswordSubmit}
              className="w-full space-y-5"
              noValidate
            >
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-800">Forgot Password</h3>
                <p className="text-sm text-slate-500">
                  Enter your email address to receive password reset instructions.
                </p>
              </div>

              {forgotSuccess && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-green-200 bg-green-50 p-3.5 text-sm text-green-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{forgotSuccess}</span>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  id="forgot-email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  required
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>

              <Button loading={forgotLoading} type="submit">
                Send Reset Link
              </Button>

              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setForgotSuccess('');
                  setForgotEmail('');
                }}
                className="flex w-full cursor-pointer items-center justify-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-800 focus:outline-none"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

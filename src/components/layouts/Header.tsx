import { Link } from 'react-router-dom';
import { useAuth } from '@/context/auth/useAuth';

export const Header = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="w-full bg-white font-sans">
      {/* Logo Section */}
      <div className="bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-0">
          <div className="flex items-center gap-5">
            <Link to="/">
              <img
                src="https://nss.gov.in/sites/all/themes/youthaffair/logo.png"
                alt="NSS Logo"
                className="h-34 object-contain"
              />
            </Link>
          </div>

          <div>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyIgiUYbCOlOhfeQeBj4mxI5Og0uFKJdfI3A&s"
              alt="Swachh Bharat"
              className="h-24"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#2d348f]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between overflow-x-auto">
          {/* Left Side: HOME */}
          <Link
            to="/"
            className="px-5 py-4 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-[#ef4a24]"
          >
            HOME
          </Link>

          {/* Right Side: LOGIN / DASHBOARD */}
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-green-600 px-6 py-4 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-green-700"
            >
              DASHBOARD
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-green-600 px-6 py-4 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-green-700"
            >
              LOGIN
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

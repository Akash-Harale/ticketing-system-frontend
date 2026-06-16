import { useAuth } from '@/context/auth/useAuth';

interface ProfileMenuProps {
  onProfileClick: () => void;
}

export const ProfileMenu = ({ onProfileClick }: ProfileMenuProps) => {
  const { user } = useAuth();

  // Get first letter and make it uppercase
  const getInitial = (email?: string) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="relative">
      <button
        id="btn-navbar-profile"
        onClick={onProfileClick}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        aria-label="Open my profile details"
      >
        {getInitial(user?.email)}
      </button>
    </div>
  );
};

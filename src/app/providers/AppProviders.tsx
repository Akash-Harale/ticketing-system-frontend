import { ReactNode } from 'react';
import { AuthProvider } from '@/context/auth/AuthProvider';

interface Props {
  children: ReactNode;
}

export const AppProviders = ({ children }: Props) => {
  return <AuthProvider>{children}</AuthProvider>;
};

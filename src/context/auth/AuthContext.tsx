import { createContext } from 'react';

// All roles defined in the new RBAC seed
export type UserRole =
  | 'Superadmin'
  | 'NSS_Admin'
  | 'NSS_User'
  | 'PMU_Admin'
  | 'PMU_User'
  | 'Porgram_unit_coordinator';

export interface RoleId {
  _id: string;
  name: UserRole;
  description?: string;
}

export interface User {
  _id: string;
  email: string;
  role_id: RoleId;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

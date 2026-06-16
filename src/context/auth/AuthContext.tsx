import { createContext } from 'react';

// All roles defined in the new RBAC seed
export type UserRole =
  | 'Superadmin'
  | 'NSS_Admin'
  | 'NSS_User'
  | 'PMU_Admin'
  | 'PMU_User'
  | 'Porgram_unit_coordinator';

export interface Resource {
  _id: string;
  name: string;
  description?: string;
}

export interface Privilege {
  _id: string;
  name: string;
  action: string;
  resource: Resource | null;
  description?: string;
}

export interface RoleId {
  _id: string;
  name: UserRole;
  description?: string;
  privileges: Privilege[];
}

export interface MemberOrganization {
  _id: string;
  orgn_name: string;
  orgn_id: string;
  orgn_type: string;
  orgn_state?:
    | {
        _id: string;
        state_name: string;
      }
    | string;
  orgn_district?:
    | {
        _id: string;
        district_name: string;
      }
    | string;
}

export interface MemberDetail {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role_id: string;
  organization: MemberOrganization;
  active: boolean;
  joinedAt?: string;
  createdAt?: string;
}

export interface User {
  _id: string;
  email: string;
  role_id: RoleId;
  createdAt?: string;
  updatedAt?: string;
  member_id?: MemberDetail;
  orgn_id?: MemberOrganization;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

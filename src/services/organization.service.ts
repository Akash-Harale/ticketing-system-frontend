import { api } from '@/api/axios';

// ── Types ────────────────────────────────────────────────────────────────────

export interface Coordinator {
  name: string;
  email: string;
  mobile: string;
}

export interface CreateOrganizationPayload {
  orgn_id: string;
  orgn_type: 'PU' | 'NSS' | 'PMU' | 'PC' | 'OTH';
  orgn_name: string;
  orgn_address1?: string;
  orgn_address2?: string;
  orgn_place?: string;
  orgn_district?: string; // ObjectId string
  orgn_state: string; // ObjectId string
  orgn_pincode: string;
  coordinator?: Coordinator;
}

export interface Organization {
  _id: string;
  orgn_id: string;
  orgn_type: string;
  orgn_name: string;
  orgn_address1?: string;
  orgn_address2?: string;
  orgn_place?: string;
  orgn_district?: { _id: string; district_name: string } | string;
  orgn_state?: { _id: string; state_name: string } | string;
  orgn_pincode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role_id?: { _id: string; name: string };
  organization?: Organization;
  designation?: string;
  active: boolean;
  joinedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

// ── Service ──────────────────────────────────────────────────────────────────

export const organizationService = {
  /**
   * Create a new organization.
   * When `coordinator` is included (PU type), the server also
   * creates a Member + User record in one transaction.
   */
  create: async (payload: CreateOrganizationPayload) => {
    const { data } = await api.post<ApiResponse<{ organization: Organization }>>(
      '/organizations',
      payload,
    );
    return data;
  },

  /** Fetch all organizations */
  getAll: async () => {
    const { data } = await api.get<ApiResponse<Organization[]>>('/organizations');
    return data;
  },

  /** Fetch a single organization by Mongo _id */
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Organization>>(`/organizations/${id}`);
    return data;
  },

  /** Update an organization */
  update: async (id: string, payload: Partial<CreateOrganizationPayload>) => {
    const { data } = await api.put<ApiResponse<Organization>>(`/organizations/${id}`, payload);
    return data;
  },

  /** Delete an organization */
  remove: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/organizations/${id}`);
    return data;
  },
  /** Fetch coordinator (member) for a given org _id */
  getCoordinatorByOrg: async (orgId: string) => {
    const { data } = await api.get<ApiResponse<Member[]>>(`/members?organization=${orgId}`);
    return data.data[0] ?? null;
  },

  /** Fetch all members */
  getAllMembers: async () => {
    const { data } = await api.get<ApiResponse<Member[]>>('/members');
    return data;
  },
};

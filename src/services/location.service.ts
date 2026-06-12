import { api } from '@/api/axios';

// ── Types ────────────────────────────────────────────────────────────────────

export interface State {
  _id: string;
  state_name: string;
  state_code?: string;
}

export interface District {
  _id: string;
  district_name: string;
  state_id: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ── Service ──────────────────────────────────────────────────────────────────

export const locationService = {
  /** Fetch all states */
  getStates: async (): Promise<State[]> => {
    const { data } = await api.get<ApiResponse<State[]>>('/location/states');
    return data.data;
  },

  /** Fetch all districts for a given state ObjectId */
  getDistrictsByState: async (stateId: string): Promise<District[]> => {
    const { data } = await api.get<ApiResponse<District[]>>(
      `/location/states/${stateId}/districts`,
    );
    return data.data;
  },
};

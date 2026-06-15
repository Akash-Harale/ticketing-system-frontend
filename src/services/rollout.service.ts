import { api } from '@/api/axios';

export interface BackendTask {
  _id?: string;
  task_id: string;
  task_name: string;
  task_desc: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface InstituteEntry {
  id: string;
  name: string;
  type: string;
}

export interface DistrictEntry {
  id: string;
  name: string;
  institutes: InstituteEntry[];
}

export interface StateEntry {
  id: string;
  name: string;
  districts: DistrictEntry[];
}

export interface RolloutCampaign {
  id: string;
  title: string;
  templateName: string;
  sentDate: string;
  status: 'Active' | 'Completed' | 'Draft';
  totalStates: number;
  totalInstitutes: number;
  states: StateEntry[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const rolloutService = {
  getRollouts: async (): Promise<RolloutCampaign[]> => {
    const { data } = await api.get<ApiResponse<RolloutCampaign[]>>('/rollouts');
    return data.data;
  },

  createRollout: async (payload: {
    title: string;
    states: string[];
    districts: string[];
  }): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>('/rollouts', payload);
    return data.data;
  },

  getMasterTemplates: async (): Promise<BackendTask[]> => {
    const { data } = await api.get<ApiResponse<BackendTask[]>>('/mastertemplates');
    return data.data;
  },

  createMasterTemplate: async (payload: Omit<BackendTask, '_id'>): Promise<BackendTask> => {
    const { data } = await api.post<ApiResponse<BackendTask>>('/mastertemplates', payload);
    return data.data;
  },

  updateMasterTemplate: async (id: string, payload: Partial<BackendTask>): Promise<BackendTask> => {
    const { data } = await api.put<ApiResponse<BackendTask>>(`/mastertemplates/${id}`, payload);
    return data.data;
  },

  deleteMasterTemplate: async (id: string): Promise<unknown> => {
    const { data } = await api.delete<ApiResponse<unknown>>(`/mastertemplates/${id}`);
    return data.data;
  },
};

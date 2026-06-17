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
  rolloutId?: string;
  start_date?: string | null;
  end_date?: string | null;
  tasks?: RolloutTask[];
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
  start_date?: string | null;
  end_date?: string | null;
  totalStates: number;
  totalInstitutes: number;
  states: StateEntry[];
  tasks?: RolloutTask[];
}

export interface RolloutTask {
  task_id: string;
  task_name: string;
  task_desc: string;
  task_priority: 'High' | 'Medium' | 'Low';
  task_dependency?: string;
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  task_status: 'Open' | 'Pending' | 'In-progress' | 'Complete' | 'Closed' | 'Reopened';
  tracking_comments?: string;
}

export interface CoordinatorRollout {
  _id: string;
  campaign_id: {
    _id: string;
    title: string;
    status: string;
    sentDate: string;
  };
  orgn_id: string;
  tasks: RolloutTask[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const rolloutService = {
  getCoordinatorRollouts: async (orgnId: string): Promise<CoordinatorRollout[]> => {
    const { data } = await api.get<ApiResponse<CoordinatorRollout[]>>(
      `/rollouts?orgn_id=${orgnId}`,
    );
    return data.data;
  },

  getRollouts: async (): Promise<RolloutCampaign[]> => {
    const { data } = await api.get<ApiResponse<RolloutCampaign[]>>('/rollouts');
    return data.data;
  },

  createRollout: async (payload: {
    title: string;
    states: string[];
    districts: string[];
    start_date?: string | null;
    end_date?: string | null;
    tasks?: Array<{
      task_id: string;
      task_name: string;
      task_desc?: string;
      task_priority: 'High' | 'Medium' | 'Low';
      planned_start_date?: string | null;
      planned_end_date?: string | null;
    }>;
  }): Promise<unknown> => {
    const { data } = await api.post<ApiResponse<unknown>>('/rollouts', payload);
    return data.data;
  },

  updateRollout: async (
    id: string,
    payload: { start_date?: string | null; end_date?: string | null },
  ): Promise<unknown> => {
    const { data } = await api.put<ApiResponse<unknown>>(`/rollouts/${id}`, payload);
    return data.data;
  },

  updateCampaign: async (
    campaignId: string,
    payload: {
      title?: string;
      start_date?: string | null;
      end_date?: string | null;
      tasks?: Array<{
        task_id: string;
        task_name: string;
        task_desc?: string;
        task_priority: 'High' | 'Medium' | 'Low';
        planned_start_date?: string | null;
        planned_end_date?: string | null;
      }>;
    },
  ): Promise<unknown> => {
    const { data } = await api.put<ApiResponse<unknown>>(
      `/rollouts/campaign/${campaignId}`,
      payload,
    );
    return data.data;
  },

  deleteRollout: async (id: string): Promise<unknown> => {
    const { data } = await api.delete<ApiResponse<unknown>>(`/rollouts/${id}`);
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

  getTasksForOrg: async (orgId: string, campaignId?: string): Promise<RolloutTask[]> => {
    const url = campaignId
      ? `/rollouttasks/org/${orgId}/tasks?campaign_id=${campaignId}`
      : `/rollouttasks/org/${orgId}/tasks`;
    const { data } = await api.get<ApiResponse<RolloutTask[]>>(url);
    return data.data;
  },

  updateTaskForOrg: async (
    orgId: string,
    taskId: string,
    payload: Partial<RolloutTask>,
  ): Promise<RolloutTask> => {
    const { data } = await api.put<ApiResponse<RolloutTask>>(
      `/rollouttasks/org/${orgId}/tasks/${taskId}`,
      payload,
    );
    return data.data;
  },

  addCampaignTargets: async (
    id: string,
    payload: { states: string[]; districts: string[] },
  ): Promise<unknown> => {
    const { data } = await api.put<ApiResponse<unknown>>(`/rollouts/${id}/target`, payload);
    return data.data;
  },
};

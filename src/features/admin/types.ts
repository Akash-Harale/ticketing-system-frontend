// Shared types for Admin feature components

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

export interface Role {
  _id: string;
  name: string;
  description?: string;
  privileges: Privilege[];
}

export type NotifyFn = (msg: string, type?: 'success' | 'error') => void;

import { apiFetch } from './client';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  phone: string;
  buildingId: string;
  room: string;
}

export const getStaff = async (): Promise<StaffMember[]> => {
  return await apiFetch<StaffMember[]>('/employees');
};

export const createStaff = async (staffData: Partial<StaffMember>): Promise<StaffMember> => {
  return await apiFetch<StaffMember>('/employees', {
    method: 'POST',
    body: JSON.stringify(staffData),
  });
};

export const updateStaff = async (id: string, staffData: Partial<StaffMember>): Promise<StaffMember> => {
  return await apiFetch<StaffMember>(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(staffData),
  });
};

export const deleteStaff = async (id: string): Promise<void> => {
  await apiFetch<void>(`/employees/${id}`, {
    method: 'DELETE',
  });
};

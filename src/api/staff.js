import { apiFetch } from './client';

export const getStaff = async () => {
  return await apiFetch('/employees');
};

export const createStaff = async (staffData) => {
  return await apiFetch('/employees', {
    method: 'POST',
    body: JSON.stringify(staffData),
  });
};

export const updateStaff = async (id, staffData) => {
  return await apiFetch(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(staffData),
  });
};

export const deleteStaff = async (id) => {
  await apiFetch(`/employees/${id}`, {
    method: 'DELETE',
  });
};

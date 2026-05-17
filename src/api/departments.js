import { apiFetch } from './client';

export const getDepartments = async () => {
  return await apiFetch('/departments');
};

export const getDepartment = async (id) => {
  return await apiFetch(`/departments/${id}`);
};

export const createDepartment = async (data) => {
  return await apiFetch('/departments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateDepartment = async (id, data) => {
  return await apiFetch(`/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteDepartment = async (id) => {
  await apiFetch(`/departments/${id}`, {
    method: 'DELETE',
  });
};

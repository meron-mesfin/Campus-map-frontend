import { apiFetch } from './client';

// ─── Admin Management ────────────────────────────────────────────────────────

/** POST /api/admin/create-admin  (system_admin only) */
export async function createAdmin(email, password) {
  return apiFetch('/admin/create-admin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/** GET /api/admin  (system_admin only) */
export async function getAdmins() {
  return apiFetch('/admin');
}

/** PUT /api/admin/:id  (system_admin only) */
export async function updateAdmin(id, payload) {
  return apiFetch(`/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/** DELETE /api/admin/:id  (system_admin only) */
export async function deleteAdmin(id) {
  await apiFetch(`/admin/${id}`, { method: 'DELETE' });
}

/** GET /api/admin/activity (system_admin only) */
export async function getActivityLogs() {
  return apiFetch('/admin/activity');
}

/** DELETE /api/admin/activity/:id (system_admin only) */
export async function deleteActivityLog(id) {
  await apiFetch(`/admin/activity/${id}`, { method: 'DELETE' });
}

/** DELETE /api/admin/activity/clear (system_admin only) */
export async function clearActivityLogs() {
  await apiFetch('/admin/activity/clear', { method: 'DELETE' });
}

/** PATCH /api/admin/role/:id  (system_admin only) */
export async function changeAdminRole(id, role) {
  await apiFetch(`/admin/role/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

// ─── Feedback Moderation ─────────────────────────────────────────────────────

/** GET /api/admin/feedback  (system_admin | campus_admin) */
export async function getFeedback(status, type) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (type) params.append('type', type);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/admin/feedback${query}`);
}

/** PATCH /api/admin/feedback/:id/resolve */
export async function resolveFeedback(id) {
  const data = await apiFetch(`/admin/feedback/${id}/resolve`, {
    method: 'PATCH',
  });
  return data.feedback;
}

/** DELETE /api/admin/feedback/:id */
export async function deleteFeedback(id) {
  await apiFetch(`/admin/feedback/${id}`, {
    method: 'DELETE',
  });
}

// ─── Reports & Analytics ─────────────────────────────────────────────────────

/** GET /api/admin/reports */
export async function getReports(startDate, endDate) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/admin/reports${query}`);
}

/** GET /api/admin/reports/analytics */
export async function getAnalytics(startDate, endDate) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/admin/reports/analytics${query}`);
}

// ─── Staff / Employees ───────────────────────────────────────────────────────

/** GET /api/employees/:id */
export async function getEmployee(id) {
  return apiFetch(`/employees/${id}`);
}

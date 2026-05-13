import { apiFetch } from './client';

// ─── Admin Management ────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  role: 'system_admin' | 'campus_admin';
  status?: 'Active' | 'Inactive';
  created_at?: string;
}

/** POST /api/admin/create-admin  (system_admin only) */
export async function createAdmin(email: string, password: string): Promise<AdminUser> {
  return apiFetch<AdminUser>('/admin/create-admin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/** GET /api/admin  (system_admin only) */
export async function getAdmins(): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>('/admin');
}

/** PUT /api/admin/:id  (system_admin only) */
export async function updateAdmin(id: string, payload: { email: string; password?: string }): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/** DELETE /api/admin/:id  (system_admin only) */
export async function deleteAdmin(id: string): Promise<void> {
  await apiFetch(`/admin/${id}`, { method: 'DELETE' });
}

/** GET /api/admin/activity (system_admin only) */
export async function getActivityLogs(): Promise<any[]> {
  return apiFetch<any[]>('/admin/activity');
}

/** DELETE /api/admin/activity/:id (system_admin only) */
export async function deleteActivityLog(id: string): Promise<void> {
  await apiFetch(`/admin/activity/${id}`, { method: 'DELETE' });
}

/** DELETE /api/admin/activity/clear (system_admin only) */
export async function clearActivityLogs(): Promise<void> {
  await apiFetch('/admin/activity/clear', { method: 'DELETE' });
}

/** PATCH /api/admin/role/:id  (system_admin only) */
export async function changeAdminRole(id: string, role: string): Promise<void> {
  await apiFetch(`/admin/role/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

// ─── Feedback Moderation ─────────────────────────────────────────────────────

export interface FeedbackItem {
  id: string;
  user_id?: string;
  type: 'building' | 'system';
  category?: string;
  message: string;
  status: 'pending' | 'resolved';
  target_id?: string;
  building_name?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

/** GET /api/admin/feedback  (system_admin | campus_admin) */
export async function getFeedback(status?: 'pending' | 'resolved', type?: 'building' | 'system'): Promise<FeedbackItem[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (type) params.append('type', type);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<FeedbackItem[]>(`/admin/feedback${query}`);
}

/** PATCH /api/admin/feedback/:id/resolve */
export async function resolveFeedback(id: string): Promise<FeedbackItem> {
  const data = await apiFetch<{ feedback: FeedbackItem }>(`/admin/feedback/${id}/resolve`, {
    method: 'PATCH',
  });
  return data.feedback;
}

/** DELETE /api/admin/feedback/:id */
export async function deleteFeedback(id: string): Promise<void> {
  await apiFetch(`/admin/feedback/${id}`, {
    method: 'DELETE',
  });
}

// ─── Reports & Analytics ─────────────────────────────────────────────────────

export interface Reports {
  totalBuildings: number;
  totalFeedback: number;
  pendingFeedback: number;
  activeUsers: number;
}

export interface Analytics {
  topSearches: { query: string; count: number }[];
  topFavorites: { id: string; name: string; count: number }[];
  buildingsByCategory: { category: string; count: number }[];
}

/** GET /api/admin/reports */
export async function getReports(): Promise<Reports> {
  return apiFetch<Reports>('/admin/reports');
}

/** GET /api/admin/reports/analytics */
export async function getAnalytics(): Promise<Analytics> {
  return apiFetch<Analytics>('/admin/reports/analytics');
}

// ─── Staff / Employees ───────────────────────────────────────────────────────

export interface StaffMember {
  id: string;
  name: string;
  position: string;
  email?: string;
  departmentName?: string;
  buildingId?: string;
  buildingName?: string;
  buildingCode?: string;
  coordinates?: { latitude: number; longitude: number } | null;
}

/** GET /api/employees/:id */
export async function getEmployee(id: string): Promise<StaffMember> {
  return apiFetch<StaffMember>(`/employees/${id}`);
}

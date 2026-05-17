import { apiFetch, setToken, clearToken } from './client';

/**
 * POST /api/auth/login
 * Returns the decoded user profile extracted from the JWT payload.
 */
export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  setToken(data.token);

  // Decode the JWT payload (no verification needed on client)
  const payload = JSON.parse(atob(data.token.split('.')[1]));
  return {
    id: String(payload.id),
    email,
    name: payload.full_name ?? email.split('@')[0],   // graceful fallback to email prefix
    full_name: payload.full_name,
    role: payload.role,
    status: 'Active',
    profile_picture: payload.profile_picture,
  };
}

/**
 * PUT /api/auth/profile
 */
export async function updateProfile(fullName, email, profilePicture, currentPassword, newPassword) {
  const data = await apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ fullName, email, profilePicture, currentPassword, newPassword }),
  });
  return data.user;
}

/**
 * POST /api/auth/register-admin  (first-time system admin setup)
 */
export async function registerAdmin(email, password) {
  return apiFetch('/auth/register-admin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(email) {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * POST /api/auth/reset-password
 */
export async function resetPassword(email, token, newPassword) {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, token, newPassword }),
  });
}

export function logout() {
  clearToken();
}

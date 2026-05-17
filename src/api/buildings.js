import { apiFetch } from './client';

/** GET /api/buildings */
export async function getBuildings() {
  return apiFetch('/buildings');
}

/** GET /api/buildings/:id */
export async function getBuilding(id) {
  return apiFetch(`/buildings/${id}`);
}

/** POST /api/buildings  (admin only) */
export async function createBuilding(payload) {
  const data = await apiFetch('/buildings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.building;
}

/** PUT /api/buildings/:id  (admin only) */
export async function updateBuilding(id, payload) {
  const data = await apiFetch(`/buildings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return data.building;
}

/** DELETE /api/buildings/:id  (admin only) */
export async function deleteBuilding(id) {
  await apiFetch(`/buildings/${id}`, { method: 'DELETE' });
}

/**
 * POST /api/buildings/:id/image  (admin only)
 * Uploads an image file; returns the Cloudinary URL.
 */
export async function uploadBuildingImage(id, file) {
  const formData = new FormData();
  formData.append('image', file);

  const { getToken, API_BASE } = await import('./client');
  const token = getToken();

  const res = await fetch(`${API_BASE}/buildings/${id}/image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.image_url;
}

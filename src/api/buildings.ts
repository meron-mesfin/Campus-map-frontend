import { apiFetch } from './client';

export interface Building {
  id: string;
  name: string;
  category: string;          // maps to frontend "type"
  description: string;
  latitude: number;
  longitude: number;
  building_number?: string;
  opening_hours?: string;
  contact?: string;
  image_url?: string;
}

export interface CreateBuildingPayload {
  name: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  building_number?: string;
  opening_hours?: string;
  contact?: string;
  image_url?: string;
}

/** GET /api/buildings */
export async function getBuildings(): Promise<Building[]> {
  return apiFetch<Building[]>('/buildings');
}

/** GET /api/buildings/:id */
export async function getBuilding(id: string): Promise<Building> {
  return apiFetch<Building>(`/buildings/${id}`);
}

/** POST /api/buildings  (admin only) */
export async function createBuilding(payload: CreateBuildingPayload): Promise<Building> {
  const data = await apiFetch<{ building: Building }>('/buildings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.building;
}

/** PUT /api/buildings/:id  (admin only) */
export async function updateBuilding(id: string, payload: Partial<CreateBuildingPayload>): Promise<Building> {
  const data = await apiFetch<{ building: Building }>(`/buildings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return data.building;
}

/** DELETE /api/buildings/:id  (admin only) */
export async function deleteBuilding(id: string): Promise<void> {
  await apiFetch(`/buildings/${id}`, { method: 'DELETE' });
}

/**
 * POST /api/buildings/:id/image  (admin only)
 * Uploads an image file; returns the Cloudinary URL.
 */
export async function uploadBuildingImage(id: string, file: File): Promise<string> {
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
  return data.image_url as string;
}

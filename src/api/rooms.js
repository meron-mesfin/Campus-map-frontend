import { apiFetch } from './client';

export const ROOM_TYPES = ['lab', 'lecture', 'office', 'library', 'toilet', 'cafeteria', 'meeting', 'other'];

/** GET /rooms */
export async function getRooms() {
  return apiFetch('/rooms');
}

/** GET /buildings/:buildingId/rooms */
export async function getRoomsByBuilding(buildingId) {
  return apiFetch(`/buildings/${buildingId}/rooms`);
}

/** GET /rooms/:id */
export async function getRoom(id) {
  return apiFetch(`/rooms/${id}`);
}

/** POST /rooms */
export async function createRoom(payload) {
  return apiFetch('/rooms', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** PUT /rooms/:id */
export async function updateRoom(id, payload) {
  return apiFetch(`/rooms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/** DELETE /rooms/:id */
export async function deleteRoom(id) {
  await apiFetch(`/rooms/${id}`, { method: 'DELETE' });
}

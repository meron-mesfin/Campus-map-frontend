import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlusIcon, Edit2Icon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Table } from '../../components/shared/Table';
import { Modal } from '../../components/shared/Modal';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

import * as roomsApi from '../../api/rooms';
import * as buildingsApi from '../../api/buildings';
import * as departmentsApi from '../../api/departments';

// ─── Room type metadata ───────────────────────────────────────────────────────

const ROOM_TYPE_META = {
  lab:       { label: 'Laboratory',   color: '#1A73E8', bg: '#E8F1FE' },
  lecture:   { label: 'Lecture Hall', color: '#7F77DD', bg: '#F0EFFC' },
  office:    { label: 'Office',       color: '#E67E22', bg: '#FDF0E5' },
  library:   { label: 'Library',      color: '#1D9E75', bg: '#E3F6F1' },
  toilet:    { label: 'Restroom',     color: '#64748B', bg: '#F1F5F9' },
  cafeteria: { label: 'Cafeteria',    color: '#EF9F27', bg: '#FEF3E2' },
  meeting:   { label: 'Meeting Room', color: '#0097A7', bg: '#E0F5F7' },
  other:     { label: 'Room',         color: '#546E7A', bg: '#ECEFF1' },
};

const ROOM_TYPES = Object.keys(ROOM_TYPE_META);

// ─── isOpen helper ───────────────────────────────────────────────────────────

function isOpen(openingHours) {
  if (!openingHours) return null;
  try {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours() + now.getMinutes() / 60;
    const lower = openingHours.toLowerCase();
    if (lower.includes('mon-fri') && (day === 0 || day === 6)) return false;
    const match = lower.match(
      /(\d{1,2}):?(\d{0,2})\s*(am|pm)?\s*[-–]\s*(\d{1,2}):?(\d{0,2})\s*(am|pm)?/
    );
    if (!match) return null;
    const toHour = (h, m, period) => {
      let hr = parseInt(h);
      const mn = parseInt(m || '0') / 60;
      if (period === 'pm' && hr !== 12) hr += 12;
      if (period === 'am' && hr === 12) hr = 0;
      return hr + mn;
    };
    return (
      hour >= toHour(match[1], match[2], match[3]) &&
      hour < toHour(match[4], match[5], match[6])
    );
  } catch { return null; }
}

// ─── Default form data ────────────────────────────────────────────────────────

const defaultForm = () => ({
  name: '',
  room_number: '',
  building_id: '',
  floor: 0,
  type: 'other',
  capacity: undefined,
  opening_hours: '',
  description: '',
  facilities: '',
  department_id: '',
});

// ─── Component ────────────────────────────────────────────────────────────────

export function Rooms() {
  const [searchParams] = useSearchParams();
  const initialBuilding = searchParams.get('building') ?? 'all';

  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState(initialBuilding);
  const [typeFilter, setTypeFilter] = useState('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(defaultForm());
  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    const newErrors = { ...errors };
    
    if (field === 'name') {
      if (!value || !value.trim()) {
        newErrors.name = 'Room Name is required';
      } else if (value.trim().length < 3) {
        newErrors.name = 'Room Name must be at least 3 characters long';
      } else if (value.trim().length > 100) {
        newErrors.name = 'Room Name must not exceed 100 characters';
      } else {
        delete newErrors.name;
      }
    }
    
    if (field === 'room_number') {
      if (!value || !value.trim()) {
        newErrors.room_number = 'Room Number is required';
      } else {
        const roomNumRegex = /^[A-Za-z0-9\-_\s]+$/;
        if (!roomNumRegex.test(value.trim())) {
          newErrors.room_number = 'Room Number must contain only letters, numbers, spaces, hyphens, or underscores';
        } else {
          delete newErrors.room_number;
        }
      }
    }

    if (field === 'building_id') {
      if (!value && value !== 0) {
        newErrors.building_id = 'Building is required';
      } else {
        delete newErrors.building_id;
      }
    }

    if (field === 'floor') {
      const flr = parseInt(value, 10);
      if (isNaN(flr)) {
        newErrors.floor = 'Floor must be a valid number';
      } else if (flr < 0) {
        newErrors.floor = 'Floor must be 0 (Ground) or greater';
      } else {
        delete newErrors.floor;
      }
    }

    if (field === 'capacity') {
      if (value !== undefined && value !== '' && value !== null) {
        const cap = parseInt(value, 10);
        if (isNaN(cap) || cap <= 0) {
          newErrors.capacity = 'Capacity must be a positive number greater than 0';
        } else {
          delete newErrors.capacity;
        }
      } else {
        delete newErrors.capacity;
      }
    }
    
    setErrors(newErrors);
    return newErrors;
  };

  const validateForm = () => {
    let tempErrors = {};
    
    if (!formData.name || !formData.name.trim()) {
      tempErrors.name = 'Room Name is required';
    } else if (formData.name.trim().length < 3) {
      tempErrors.name = 'Room Name must be at least 3 characters long';
    } else if (formData.name.trim().length > 100) {
      tempErrors.name = 'Room Name must not exceed 100 characters';
    }
    
    if (!formData.room_number || !formData.room_number.trim()) {
      tempErrors.room_number = 'Room Number is required';
    } else {
      const roomNumRegex = /^[A-Za-z0-9\-_\s]+$/;
      if (!roomNumRegex.test(formData.room_number.trim())) {
        tempErrors.room_number = 'Room Number must contain only letters, numbers, spaces, hyphens, or underscores';
      }
    }

    if (!formData.building_id && formData.building_id !== 0) {
      tempErrors.building_id = 'Building is required';
    }

    const flr = parseInt(formData.floor, 10);
    if (isNaN(flr)) {
      tempErrors.floor = 'Floor must be a valid number';
    } else if (flr < 0) {
      tempErrors.floor = 'Floor must be 0 (Ground) or greater';
    }

    if (formData.capacity !== undefined && formData.capacity !== '' && formData.capacity !== null) {
      const cap = parseInt(formData.capacity, 10);
      if (isNaN(cap) || cap <= 0) {
        tempErrors.capacity = 'Capacity must be a positive number greater than 0';
      }
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // ─── Data fetching ─────────────────────────────────────────────────────────

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsData, buildingsData, departmentsData] = await Promise.all([
        roomsApi.getRooms(),
        buildingsApi.getBuildings(),
        departmentsApi.getDepartments(),
      ]);
      setRooms(roomsData);
      setBuildings(buildingsData);
      setDepartments(departmentsData);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── Filtering ─────────────────────────────────────────────────────────────

  const filteredRooms = rooms.filter((room) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      room.name.toLowerCase().includes(q) ||
      room.room_number.toLowerCase().includes(q) ||
      (room.facilities && room.facilities.toLowerCase().includes(q));
    const matchesBuilding =
      buildingFilter === 'all' || String(room.building_id) === String(buildingFilter);
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    return matchesSearch && matchesBuilding && matchesType;
  });

  // ─── Modal helpers ─────────────────────────────────────────────────────────

  const handleOpenForm = (room) => {
    setErrors({});
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        room_number: room.room_number,
        building_id: room.building_id,
        floor: room.floor,
        type: room.type,
        capacity: room.capacity,
        opening_hours: room.opening_hours ?? '',
        description: room.description ?? '',
        facilities: room.facilities ?? '',
        department_id: room.department_id ?? '',
      });
    } else {
      setEditingRoom(null);
      setFormData({
        ...defaultForm(),
        building_id: buildingFilter !== 'all' ? buildingFilter : '',
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (editingRoom) {
        await roomsApi.updateRoom(editingRoom.id, payload);
        toast.success('Room updated successfully');
      } else {
        await roomsApi.createRoom(payload);
        toast.success('Room created successfully');
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message ?? 'Failed to save room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!roomToDelete) return;
    setIsSubmitting(true);
    try {
      await roomsApi.deleteRoom(roomToDelete.id);
      toast.success('Room deleted successfully');
      setIsDeleteOpen(false);
      setRoomToDelete(null);
      fetchData();
    } catch (err) {
      toast.error(err.message ?? 'Failed to delete room');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Table columns ─────────────────────────────────────────────────────────

  const columns = [
    {
      header: 'Room',
      accessor: (room) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{room.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{room.room_number}</div>
          {room.facilities && (
            <div className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1 truncate max-w-[160px]" title={room.facilities}>
              🛠️ {room.facilities}
            </div>
          )}
        </div>
      ),
      className: 'min-w-[180px]',
    },
    {
      header: 'Building',
      accessor: (room) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {room.building_name ?? '—'}
        </span>
      ),
    },
    {
      header: 'Type',
      accessor: (room) => {
        const meta = ROOM_TYPE_META[room.type] ?? ROOM_TYPE_META.other;
        return (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ color: meta.color, backgroundColor: meta.bg }}
          >
            {meta.label}
          </span>
        );
      },
    },
    {
      header: 'Floor',
      accessor: (room) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">Floor {room.floor}</span>
      ),
    },
    {
      header: 'Capacity',
      accessor: (room) =>
        room.capacity ? (
          <span className="text-sm text-slate-600 dark:text-slate-400">{room.capacity} seats</span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      header: 'Hours',
      accessor: (room) =>
        room.opening_hours ? (
          <span className="text-xs text-slate-600 dark:text-slate-400 truncate block max-w-[120px]">
            {room.opening_hours.length > 20
              ? room.opening_hours.slice(0, 20) + '…'
              : room.opening_hours}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      header: 'Status',
      accessor: (room) => {
        const open = isOpen(room.opening_hours);
        if (open === null) return <span className="text-slate-400">—</span>;
        return open ? (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Open
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Closed
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (room) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenForm(room)}
            className="p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2Icon size={16} />
          </button>
          <button
            onClick={() => { setRoomToDelete(room); setIsDeleteOpen(true); }}
            className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2Icon size={16} />
          </button>
        </div>
      ),
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading && rooms.length === 0) {
    return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rooms</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage all campus rooms across buildings
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2 bg-[#0d6a49] hover:bg-[#0a5a3d] text-white rounded-lg transition-colors shrink-0"
        >
          <PlusIcon size={18} />
          <span>Add Room</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or room number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] max-w-sm px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d6a49] outline-none"
        />
        <select
          value={buildingFilter}
          onChange={(e) => setBuildingFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d6a49] outline-none"
        >
          <option value="all">All Buildings</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d6a49] outline-none"
        >
          <option value="all">All Types</option>
          {ROOM_TYPES.map((t) => (
            <option key={t} value={t}>{ROOM_TYPE_META[t].label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Table
        data={filteredRooms}
        columns={columns}
        keyExtractor={(room) => String(room.id)}
        emptyMessage="No rooms found. Try adjusting your filters."
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingRoom ? 'Edit Room' : 'Add Room'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* Room Type Chips */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Room Type
            </label>
            <div className="flex flex-wrap gap-2">
              {ROOM_TYPES.map((t) => {
                const selected = formData.type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t })}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                      selected
                        ? 'border-[#0d6a49] bg-[#E8F5E9] text-[#0d6a49]'
                        : 'border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {ROOM_TYPE_META[t].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Row 1 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Room Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.name ?? ''}
                onBlur={(e) => validate('name', e.target.value)}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) validate('name', e.target.value);
                }}
                placeholder="e.g. Computer Lab A"
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-100 dark:shadow-none'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-[#0d6a49]'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Room Number <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.room_number ?? ''}
                onBlur={(e) => validate('room_number', e.target.value)}
                onChange={(e) => {
                  setFormData({ ...formData, room_number: e.target.value });
                  if (errors.room_number) validate('room_number', e.target.value);
                }}
                placeholder="e.g. CS-101"
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                  errors.room_number
                    ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-100 dark:shadow-none'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-[#0d6a49]'
                }`}
              />
              {errors.room_number && <p className="text-xs text-red-500 mt-1">{errors.room_number}</p>}
            </div>

            {/* Row 2 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Building <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={String(formData.building_id ?? '')}
                onBlur={(e) => validate('building_id', e.target.value)}
                onChange={(e) => {
                  setFormData({ ...formData, building_id: e.target.value });
                  if (errors.building_id) validate('building_id', e.target.value);
                }}
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                  errors.building_id
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-[#0d6a49]'
                }`}
              >
                <option value="" disabled>Select a building</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {errors.building_id && <p className="text-xs text-red-500 mt-1">{errors.building_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Floor <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min={0}
                value={formData.floor ?? 0}
                onBlur={(e) => validate('floor', e.target.value)}
                onChange={(e) => {
                  setFormData({ ...formData, floor: parseInt(e.target.value) || 0 });
                  if (errors.floor) validate('floor', e.target.value);
                }}
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                  errors.floor
                    ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-100 dark:shadow-none'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-[#0d6a49]'
                }`}
              />
              {errors.floor && <p className="text-xs text-red-500 mt-1">{errors.floor}</p>}
            </div>

            {/* Row 3 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Capacity (Optional)
              </label>
              <input
                type="number"
                min={1}
                value={formData.capacity ?? ''}
                onBlur={(e) => validate('capacity', e.target.value)}
                onChange={(e) => {
                  setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : undefined });
                  if (errors.capacity) validate('capacity', e.target.value);
                }}
                placeholder="e.g. 40"
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                  errors.capacity
                    ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-100 dark:shadow-none'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-[#0d6a49]'
                }`}
              />
              {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Department (Optional)
              </label>
              <select
                value={String(formData.department_id ?? '')}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d6a49] outline-none"
              >
                <option value="">No Department</option>
                {departments
                  .filter(d => String(d.building_id) === String(formData.building_id))
                  .map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))
                }
              </select>
            </div>

            {/* Row 4 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Opening Hours (Optional)
              </label>
              <input
                type="text"
                value={formData.opening_hours ?? ''}
                onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                placeholder="Mon-Fri 8:00am – 6:00pm"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d6a49] outline-none"
              />
            </div>
            <div className="flex items-end">
              {/* placeholder to maintain 2-col grid balance */}
            </div>
          </div>

          {/* Full-width Facilities / Equipment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Facilities / Equipment (Optional)
            </label>
            <input
              type="text"
              value={formData.facilities ?? ''}
              onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
              placeholder="e.g. Projector, Whiteboard, 30 Computers, Smart Board"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d6a49] outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">Separate items with commas (e.g. Projector, Whiteboard, Smart Board)</p>
          </div>

          {/* Full-width description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.description ?? ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the room..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d6a49] outline-none resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#0d6a49] hover:bg-[#0a5a3d] disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isSubmitting && <LoadingSpinner size={16} />}
              {editingRoom ? 'Save Changes' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Room"
        message={`Are you sure you want to delete room '${roomToDelete?.name}'? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { PlusIcon, Edit2Icon, Trash2Icon, UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Table } from '../../components/shared/Table';
import { Modal } from '../../components/shared/Modal';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

import * as staffApi from '../../api/staff';
import * as buildingsApi from '../../api/buildings';
import * as deptApi from '../../api/departments';

export function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    phone: '',
    buildingId: '',
    room: ''
  });
  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    const newErrors = { ...errors };
    
    if (field === 'name') {
      if (!value || !value.trim()) {
        newErrors.name = 'Full Name is required';
      } else if (value.trim().length < 3) {
        newErrors.name = 'Name must be at least 3 characters long';
      } else if (value.trim().length > 100) {
        newErrors.name = 'Name must not exceed 100 characters';
      } else {
        delete newErrors.name;
      }
    }
    
    if (field === 'email') {
      if (!value || !value.trim()) {
        newErrors.email = 'Email address is required';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
      }
    }

    if (field === 'position') {
      if (!value || !value.trim()) {
        newErrors.position = 'Position is required';
      } else if (value.trim().length < 2) {
        newErrors.position = 'Position must be at least 2 characters long';
      } else if (value.trim().length > 100) {
        newErrors.position = 'Position must not exceed 100 characters';
      } else {
        delete newErrors.position;
      }
    }

    if (field === 'phone') {
      if (value && value.trim()) {
        const ethiopianPhoneRegex = /^(?:\+251|0)[79]\d{8}$/;
        if (!ethiopianPhoneRegex.test(value.replace(/\s+/g, ''))) {
          newErrors.phone = 'Invalid phone. Must match Ethiopian mobile format (e.g. +251912345678 or 0912345678)';
        } else {
          delete newErrors.phone;
        }
      } else {
        delete newErrors.phone;
      }
    }

    if (field === 'room') {
      if (!value || !value.trim()) {
        newErrors.room = 'Room Number is required';
      } else {
        delete newErrors.room;
      }
    }

    if (field === 'department') {
      if (!value) {
        newErrors.department = 'Department is required';
      } else {
        delete newErrors.department;
      }
    }

    if (field === 'buildingId') {
      if (!value) {
        newErrors.buildingId = 'Building is required';
      } else {
        delete newErrors.buildingId;
      }
    }
    
    setErrors(newErrors);
    return newErrors;
  };

  const validateForm = () => {
    let tempErrors = {};
    
    if (!formData.name || !formData.name.trim()) {
      tempErrors.name = 'Full Name is required';
    } else if (formData.name.trim().length < 3) {
      tempErrors.name = 'Name must be at least 3 characters long';
    } else if (formData.name.trim().length > 100) {
      tempErrors.name = 'Name must not exceed 100 characters';
    }
    
    if (!formData.email || !formData.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        tempErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.position || !formData.position.trim()) {
      tempErrors.position = 'Position is required';
    } else if (formData.position.trim().length < 2) {
      tempErrors.position = 'Position must be at least 2 characters long';
    } else if (formData.position.trim().length > 100) {
      tempErrors.position = 'Position must not exceed 100 characters';
    }

    if (formData.phone && formData.phone.trim()) {
      const ethiopianPhoneRegex = /^(?:\+251|0)[79]\d{8}$/;
      if (!ethiopianPhoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
        tempErrors.phone = 'Invalid phone. Must match Ethiopian mobile format (e.g. +251912345678 or 0912345678)';
      }
    }

    if (!formData.room || !formData.room.trim()) {
      tempErrors.room = 'Room Number is required';
    }

    if (!formData.department) {
      tempErrors.department = 'Department is required';
    }

    if (!formData.buildingId) {
      tempErrors.buildingId = 'Building is required';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffData, buildingsData, deptsData] = await Promise.all([
        staffApi.getStaff(),
        buildingsApi.getBuildings(),
        deptApi.getDepartments()
      ]);
      setStaff(staffData);
      setBuildings(buildingsData);
      setDepartments(deptsData);
      if (buildingsData.length > 0 && !formData.buildingId) {
        setFormData(prev => ({ ...prev, buildingId: String(buildingsData[0].id) }));
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getBuildingName = (buildingId) => {
    // some endpoints return numbers, let's be safe
    const location = buildings.find((loc) => String(loc.id) === String(buildingId));
    return location ? location.name : 'Unknown Building';
  };

  const filteredStaff = staff.filter((member) => {
    const query = searchQuery.toLowerCase();
    const buildingName = getBuildingName(member.buildingId).toLowerCase();
    return (
      (member.name || '').toLowerCase().includes(query) ||
      (member.email || '').toLowerCase().includes(query) ||
      (member.department || '').toLowerCase().includes(query) ||
      buildingName.includes(query)
    );
  });

  const handleOpenForm = (member) => {
    setErrors({});
    if (member) {
      setEditingStaff(member);
      setFormData({
        name: member.name || '',
        email: member.email || '',
        department: member.department || '',
        position: member.position || '',
        phone: member.phone || '',
        buildingId: member.buildingId ? String(member.buildingId) : '',
        room: member.room || ''
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        department: '',
        position: '',
        phone: '',
        buildingId: buildings.length > 0 ? String(buildings[0].id) : '',
        room: ''
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
      if (editingStaff) {
        await staffApi.updateStaff(editingStaff.id, formData);
        toast.success('Staff member updated successfully');
      } else {
        await staffApi.createStaff(formData);
        toast.success('Staff member added successfully');
      }
      setIsFormOpen(false);
      fetchData(); // Refresh the list
    } catch (error) {
      toast.error(editingStaff ? 'Failed to update staff' : 'Failed to create staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (staffToDelete) {
      setIsSubmitting(true);
      try {
        await staffApi.deleteStaff(staffToDelete.id);
        toast.success('Staff member deleted successfully');
        setIsDeleteOpen(false);
        setStaffToDelete(null);
        fetchData();
      } catch (error) {
        toast.error('Failed to delete staff member');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const columns = [
  {
    header: 'Name',
    accessor: (member) =>
    <div>
          <div className="font-medium text-slate-900 dark:text-white">
            {member.name}
          </div>
          <div className="text-xs text-slate-500">{member.email}</div>
        </div>,

    className: 'min-w-[200px]'
  },
  {
    header: 'Department',
    accessor: (member) =>
    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {member.department}
        </span>

  },
  {
    header: 'Position',
    accessor: 'position'
  },
  {
    header: 'Location',
    accessor: (member) =>
    <div>
          <div className="text-sm text-slate-700 dark:text-slate-300">
            {getBuildingName(member.buildingId)}
          </div>
          <div className="text-xs text-slate-500">Room: {member.room}</div>
        </div>

  },
  {
    header: 'Actions',
    accessor: (member) =>
    <div className="flex gap-2">
          <button
        onClick={() => handleOpenForm(member)}
        className="p-1.5 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
        title="Edit">
        
            <Edit2Icon size={16} />
          </button>
          <button
        onClick={() => {
          setStaffToDelete(member);
          setIsDeleteOpen(true);
        }}
        className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
        title="Delete">
        
            <Trash2Icon size={16} />
          </button>
        </div>

  }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Staff Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage university staff, departments, and office locations.
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shrink-0">
          
          <PlusIcon size={18} />
          <span>Add Staff</span>
        </button>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search by name, department, or building..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
        
        <Table
          data={filteredStaff}
          columns={columns}
          keyExtractor={(member) => member.id}
          emptyMessage="No staff members found matching your search." />
        
      </div>

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
        maxWidth="max-w-2xl">
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onBlur={(e) => validate('name', e.target.value)}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) validate('name', e.target.value);
                }}
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-100 dark:shadow-none'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'
                }`}
                placeholder="e.g. Dr. Jane Smith"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="email"
                value={formData.email}
                onBlur={(e) => validate('email', e.target.value)}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) validate('email', e.target.value);
                }}
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-100 dark:shadow-none'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'
                }`}
                placeholder="e.g. jane.smith@dmu.edu.et"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.department}
                onBlur={(e) => validate('department', e.target.value)}
                onChange={(e) => {
                  setFormData({ ...formData, department: e.target.value });
                  if (errors.department) validate('department', e.target.value);
                }}
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                  errors.department
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'
                }`}
              >
                <option value="" disabled>
                  Select a department
                </option>
                {departments.map((dept) =>
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                )}
                {formData.department && !departments.find(d => d.name === formData.department) && (
                  <option value={formData.department}>{formData.department}</option>
                )}
              </select>
              {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Position <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.position}
                onBlur={(e) => validate('position', e.target.value)}
                onChange={(e) => {
                  setFormData({ ...formData, position: e.target.value });
                  if (errors.position) validate('position', e.target.value);
                }}
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                  errors.position
                    ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-100 dark:shadow-none'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'
                }`}
                placeholder="e.g. Senior Lecturer"
              />
              {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone (Optional)
              </label>
              <input
                type="text"
                value={formData.phone}
                onBlur={(e) => validate('phone', e.target.value)}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) validate('phone', e.target.value);
                }}
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                  errors.phone
                    ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-100 dark:shadow-none'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'
                }`}
                placeholder="e.g. +251 911 234 567"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
              Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Building <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.buildingId}
                  onBlur={(e) => validate('buildingId', e.target.value)}
                  onChange={(e) => {
                    setFormData({ ...formData, buildingId: e.target.value });
                    if (errors.buildingId) validate('buildingId', e.target.value);
                  }}
                  className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                    errors.buildingId
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'
                  }`}
                >
                  <option value="" disabled>
                    Select a building
                  </option>
                  {buildings.map((loc) =>
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  )}
                </select>
                {errors.buildingId && <p className="text-xs text-red-500 mt-1">{errors.buildingId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Room Number <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.room}
                  onBlur={(e) => validate('room', e.target.value)}
                  onChange={(e) => {
                    setFormData({ ...formData, room: e.target.value });
                    if (errors.room) validate('room', e.target.value);
                  }}
                  className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                    errors.room
                      ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-100 dark:shadow-none'
                      : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'
                  }`}
                  placeholder="e.g. QB 2.14"
                />
                {errors.room && <p className="text-xs text-red-500 mt-1">{errors.room}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              
              {editingStaff ? 'Save Changes' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${staffToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete" />
      
    </div>);

}

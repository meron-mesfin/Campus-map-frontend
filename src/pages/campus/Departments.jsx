import React, { useState, useEffect } from 'react';
import { PlusIcon, Edit2Icon, Trash2Icon, Building2Icon, MapIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Table } from '../../components/shared/Table';
import { Modal } from '../../components/shared/Modal';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

import * as deptApi from '../../api/departments';
import * as buildingsApi from '../../api/buildings';

export function Departments() {
  const [departments, setDepartments] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, buildingFilter]);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    building_id: ''
  });
  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    const newErrors = { ...errors };
    
    if (field === 'name') {
      if (!value || !value.trim()) {
        newErrors.name = 'Department Name is required';
      } else if (value.trim().length < 3) {
        newErrors.name = 'Department Name must be at least 3 characters long';
      } else if (value.trim().length > 100) {
        newErrors.name = 'Department Name must not exceed 100 characters';
      } else {
        delete newErrors.name;
      }
    }
    
    if (field === 'description') {
      if (value && value.trim().length > 500) {
        newErrors.description = 'Description must not exceed 500 characters';
      } else {
        delete newErrors.description;
      }
    }

    if (field === 'phone') {
      if (value && value.trim()) {
        const ethiopianPhoneRegex = /^(?:\+251|0)[79]\d{8}$/;
        if (!ethiopianPhoneRegex.test(value.replace(/\s+/g, ''))) {
          newErrors.phone = 'Invalid phone number. Must match Ethiopian mobile format (e.g. +251912345678 or 0912345678)';
        } else {
          delete newErrors.phone;
        }
      } else {
        delete newErrors.phone;
      }
    }

    if (field === 'email') {
      if (value && value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          newErrors.email = 'Invalid email address';
        } else {
          delete newErrors.email;
        }
      } else {
        delete newErrors.email;
      }
    }
    
    setErrors(newErrors);
    return newErrors;
  };

  const validateForm = () => {
    let tempErrors = {};
    
    if (!formData.name || !formData.name.trim()) {
      tempErrors.name = 'Department Name is required';
    } else if (formData.name.trim().length < 3) {
      tempErrors.name = 'Department Name must be at least 3 characters long';
    } else if (formData.name.trim().length > 100) {
      tempErrors.name = 'Department Name must not exceed 100 characters';
    }
    
    if (formData.description && formData.description.trim().length > 500) {
      tempErrors.description = 'Description must not exceed 500 characters';
    }

    if (formData.phone && formData.phone.trim()) {
      const ethiopianPhoneRegex = /^(?:\+251|0)[79]\d{8}$/;
      if (!ethiopianPhoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
        tempErrors.phone = 'Invalid phone number. Must match Ethiopian mobile format (e.g. +251912345678 or 0912345678)';
      }
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        tempErrors.email = 'Invalid email address';
      }
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptData, buildingsData] = await Promise.all([
        deptApi.getDepartments(),
        buildingsApi.getBuildings()
      ]);
      setDepartments(deptData);
      setBuildings(buildingsData);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDepts = departments.filter((dept) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (dept.name || '').toLowerCase().includes(query) ||
      (dept.description || '').toLowerCase().includes(query) ||
      (dept.phone || '').toLowerCase().includes(query) ||
      (dept.email || '').toLowerCase().includes(query);
    const matchesBuilding =
      buildingFilter === 'all' || String(dept.building_id) === String(buildingFilter);
    return matchesSearch && matchesBuilding;
  });

  const totalPages = Math.ceil(filteredDepts.length / itemsPerPage);
  const paginatedDepts = filteredDepts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenForm = (dept) => {
    setErrors({});
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name || '',
        description: dept.description || '',
        phone: dept.phone || '',
        email: dept.email || '',
        building_id: dept.building_id ? String(dept.building_id) : ''
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        description: '',
        phone: '',
        email: '',
        building_id: buildingFilter !== 'all' ? buildingFilter : ''
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
      if (editingDept) {
        await deptApi.updateDepartment(editingDept.id, formData);
        toast.success('Department updated successfully');
      } else {
        await deptApi.createDepartment(formData);
        toast.success('Department created successfully');
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || (editingDept ? 'Failed to update department' : 'Failed to create department'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deptToDelete) {
      setIsSubmitting(true);
      try {
        await deptApi.deleteDepartment(deptToDelete.id);
        toast.success('Department deleted successfully');
        setIsDeleteOpen(false);
        setDeptToDelete(null);
        fetchData();
      } catch (error) {
        toast.error(error.message || 'Failed to delete department');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const columns = [
    {
      header: 'Department',
      accessor: (dept) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Building2Icon size={20} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-white">
              {dept.name}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <MapIcon size={12} />
              {dept.building_name || 'No building assigned'}
            </div>
            {dept.phone && <div className="text-xs text-slate-500 mt-0.5">📞 {dept.phone}</div>}
            {dept.email && <div className="text-xs text-slate-500">✉️ {dept.email}</div>}
          </div>
        </div>
      ),
      className: 'min-w-[250px]'
    },
    {
      header: 'Room Count',
      accessor: (dept) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
          {dept.room_count || 0} Rooms
        </span>
      )
    },
    {
      header: 'Description',
      accessor: (dept) => (
        <div className="text-sm text-slate-500 dark:text-slate-400 max-w-sm truncate" title={dept.description}>
          {dept.description || 'No description'}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (dept) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenForm(dept)}
            className="p-1.5 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2Icon size={16} />
          </button>
          <button
            onClick={() => {
              setDeptToDelete(dept);
              setIsDeleteOpen(true);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2Icon size={16} />
          </button>
        </div>
      )
    }
  ];

  if (loading && departments.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Department Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Create and manage university departments.
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shrink-0"
        >
          <PlusIcon size={18} />
          <span>Add Department</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name, contact, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] max-w-md px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0d6a49] outline-none"
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
        </div>
        
        <Table
          data={paginatedDepts}
          columns={columns}
          keyExtractor={(dept) => dept.id}
          emptyMessage="No departments found matching your search."
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredDepts.length)}</span> to{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {Math.min(currentPage * itemsPerPage, filteredDepts.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredDepts.length}</span> results
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, idx) => {
                const pageNum = idx + 1;
                const isSelected = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center text-xs font-semibold rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-[#0d6a49] bg-[#E8F5E9] text-[#0d6a49] font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingDept ? 'Edit Department' : 'Add New Department'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Department Name <span className="text-red-500">*</span>
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
              placeholder="e.g. Computer Science"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Building (Location)
            </label>
            <select
              value={formData.building_id}
              onChange={(e) => setFormData({ ...formData, building_id: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">No building assigned</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contact Phone (Optional)
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
                  : 'border-slate-300 dark:border-slate-600 focus:ring-[#0d6a49]'
              }`}
              placeholder="e.g. +251 912 345 678"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contact Email (Optional)
            </label>
            <input
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
                  : 'border-slate-300 dark:border-slate-600 focus:ring-[#0d6a49]'
              }`}
              placeholder="e.g. cs@dmu.edu.et"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onBlur={(e) => validate('description', e.target.value)}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) validate('description', e.target.value);
              }}
              className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 min-h-[100px] resize-none ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-100 dark:shadow-none'
                  : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'
              }`}
              placeholder="Brief description of the department..."
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3">
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
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isSubmitting && <LoadingSpinner size={16} />}
              {editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Are you sure you want to delete ${deptToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
}

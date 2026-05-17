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
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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
    return (
      (dept.name || '').toLowerCase().includes(query) ||
      (dept.description || '').toLowerCase().includes(query)
    );
  });

  const handleOpenForm = (dept) => {
    setErrors({});
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name || '',
        description: dept.description || '',
        building_id: dept.building_id ? String(dept.building_id) : ''
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        description: '',
        building_id: ''
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
      header: 'Department Name',
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
          </div>
        </div>
      ),
      className: 'min-w-[250px]'
    },
    {
      header: 'Description',
      accessor: (dept) => (
        <div className="text-sm text-slate-500 dark:text-slate-400 max-w-md truncate">
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
        <input
          type="text"
          placeholder="Search by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
        />
        
        <Table
          data={filteredDepts}
          columns={columns}
          keyExtractor={(dept) => dept.id}
          emptyMessage="No departments found matching your search."
        />
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

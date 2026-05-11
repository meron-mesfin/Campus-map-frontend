import React, { useState } from 'react';
import { PlusIcon, Edit2Icon, Trash2Icon, UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  initialStaff,
  initialLocations,
  StaffMember,
  Location } from
'../../data/mockData';
import { Table } from '../../components/shared/Table';
import { Modal } from '../../components/shared/Modal';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
export function StaffManagement() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [searchQuery, setSearchQuery] = useState('');
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  // Form state
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: '',
    email: '',
    department: '',
    position: '',
    phone: '',
    buildingId: initialLocations[0]?.id || '',
    room: ''
  });
  const getBuildingName = (buildingId: string) => {
    const location = initialLocations.find((loc) => loc.id === buildingId);
    return location ? location.name : 'Unknown Building';
  };
  const filteredStaff = staff.filter((member) => {
    const query = searchQuery.toLowerCase();
    const buildingName = getBuildingName(member.buildingId).toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.department.toLowerCase().includes(query) ||
      buildingName.includes(query));

  });
  const handleOpenForm = (member?: StaffMember) => {
    if (member) {
      setEditingStaff(member);
      setFormData(member);
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        department: '',
        position: '',
        phone: '',
        buildingId: initialLocations[0]?.id || '',
        room: ''
      });
    }
    setIsFormOpen(true);
  };
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      setStaff(
        staff.map((s) =>
        s.id === editingStaff.id ?
        {
          ...formData,
          id: s.id
        } as StaffMember :
        s
        )
      );
      toast.success('Staff member updated successfully');
    } else {
      const newStaff = {
        ...formData,
        id: Date.now().toString()
      } as StaffMember;
      setStaff([...staff, newStaff]);
      toast.success('Staff member added successfully');
    }
    setIsFormOpen(false);
  };
  const handleDelete = () => {
    if (staffToDelete) {
      setStaff(staff.filter((s) => s.id !== staffToDelete.id));
      toast.success('Staff member deleted successfully');
      setStaffToDelete(null);
    }
  };
  const columns = [
  {
    header: 'Name',
    accessor: (member: StaffMember) =>
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
    accessor: (member: StaffMember) =>
    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {member.department}
        </span>

  },
  {
    header: 'Position',
    accessor: 'position' as keyof StaffMember
  },
  {
    header: 'Location',
    accessor: (member: StaffMember) =>
    <div>
          <div className="text-sm text-slate-700 dark:text-slate-300">
            {getBuildingName(member.buildingId)}
          </div>
          <div className="text-xs text-slate-500">Room: {member.room}</div>
        </div>

  },
  {
    header: 'Actions',
    accessor: (member: StaffMember) =>
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
                Full Name
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value
                })
                }
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g. Dr. Jane Smith" />
              
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <input
                required
                type="text"
                value={formData.department}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  department: e.target.value
                })
                }
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g. Computer Science" />
              
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Position
              </label>
              <input
                required
                type="text"
                value={formData.position}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  position: e.target.value
                })
                }
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g. Senior Lecturer" />
              
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
              Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Building
                </label>
                <select
                  required
                  value={formData.buildingId}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    buildingId: e.target.value
                  })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                  
                  <option value="" disabled>
                    Select a building
                  </option>
                  {initialLocations.map((loc) =>
                  <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Room Number
                </label>
                <input
                  required
                  type="text"
                  value={formData.room}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    room: e.target.value
                  })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. QB 2.14" />
                
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
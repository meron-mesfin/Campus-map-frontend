import React, { useState } from 'react';
import { initialAdmins, Admin } from '../../data/mockData';
import { Table } from '../../components/shared/Table';
import { Modal } from '../../components/shared/Modal';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { PlusIcon, Edit2Icon, Trash2Icon, ShieldIcon } from 'lucide-react';
import { toast } from 'sonner';
export function ManageAdmins() {
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [formData, setFormData] = useState<Partial<Admin>>({
    name: '',
    email: '',
    role: 'Campus Admin',
    status: 'Active'
  });
  const handleOpenForm = (admin?: Admin) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData(admin);
    } else {
      setEditingAdmin(null);
      setFormData({
        name: '',
        email: '',
        role: 'Campus Admin',
        status: 'Active'
      });
    }
    setIsFormOpen(true);
  };
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAdmin) {
      setAdmins(admins.map((a) => a.id === editingAdmin.id ? {
        ...formData,
        id: a.id,
        lastLogin: a.lastLogin
      } as Admin : a));
      toast.success('Admin updated successfully');
    } else {
      const newAdmin = {
        ...formData,
        id: Date.now().toString(),
        lastLogin: 'Never'
      } as Admin;
      setAdmins([...admins, newAdmin]);
      toast.success('Admin created successfully');
    }
    setIsFormOpen(false);
  };
  const handleDelete = () => {
    if (adminToDelete) {
      setAdmins(admins.filter((a) => a.id !== adminToDelete.id));
      toast.success('Admin deleted successfully');
      setAdminToDelete(null);
    }
  };
  const columns = [{
    header: 'Name',
    accessor: (admin: Admin) => <div>
          <div className="font-medium text-slate-900 dark:text-white">
            {admin.name}
          </div>
          <div className="text-xs text-slate-500">{admin.email}</div>
        </div>
  }, {
    header: 'Role',
    accessor: (admin: Admin) => <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium border ${admin.role === 'System Admin' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' : 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-800'}`}>
          <ShieldIcon size={12} />
          {admin.role}
        </span>
  }, {
    header: 'Status',
    accessor: (admin: Admin) => <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${admin.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
          {admin.status}
        </span>
  }, {
    header: 'Last Login',
    accessor: (admin: Admin) => <span className="text-sm text-slate-500">
          {admin.lastLogin !== 'Never' ? new Date(admin.lastLogin).toLocaleString() : 'Never'}
        </span>
  }, {
    header: 'Actions',
    accessor: (admin: Admin) => <div className="flex gap-2">
          <button onClick={() => handleOpenForm(admin)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30 rounded-lg transition-colors">
            <Edit2Icon size={16} />
          </button>
          <button onClick={() => {
        setAdminToDelete(admin);
        setIsDeleteOpen(true);
      }} className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors">
            <Trash2Icon size={16} />
          </button>
        </div>
  }];
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Manage Administrators
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Create and manage system access roles.
          </p>
        </div>
        <button onClick={() => handleOpenForm()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
          <PlusIcon size={18} />
          <span>Add Admin</span>
        </button>
      </div>

      <Table data={admins} columns={columns} keyExtractor={(a) => a.id} />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingAdmin ? 'Edit Administrator' : 'Add New Administrator'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input required type="text" value={formData.name} onChange={(e) => setFormData({
            ...formData,
            name: e.target.value
          })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input required type="email" value={formData.email} onChange={(e) => setFormData({
            ...formData,
            email: e.target.value
          })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Role
              </label>
              <select value={formData.role} onChange={(e) => setFormData({
              ...formData,
              role: e.target.value as any
            })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="Campus Admin">Campus Admin</option>
                <option value="System Admin">System Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select value={formData.status} onChange={(e) => setFormData({
              ...formData,
              status: e.target.value as any
            })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
              Permissions
            </h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" defaultChecked className="rounded text-primary-600 focus:ring-primary-500" />
                Manage Locations
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" defaultChecked className="rounded text-primary-600 focus:ring-primary-500" />
                Review Feedback
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" defaultChecked={formData.role === 'System Admin'} disabled={formData.role !== 'System Admin'} className="rounded text-primary-600 focus:ring-primary-500" />
                Manage Users
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              {editingAdmin ? 'Save Changes' : 'Create Admin'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title="Delete Administrator" message={`Are you sure you want to delete ${adminToDelete?.name}? They will lose all access to the system.`} confirmText="Delete" />
    </div>;
}
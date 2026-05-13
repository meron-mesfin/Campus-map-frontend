import React, { useState, useEffect } from 'react';
import { Table } from '../../components/shared/Table';
import { Modal } from '../../components/shared/Modal';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { PlusIcon, ShieldIcon, Edit2Icon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import * as adminApi from '../../api/admin';
import type { AdminUser } from '../../api/admin';

export function ManageAdmins() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '', role: 'campus_admin' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await adminApi.getAdmins();
      setAdmins(data);
    } catch (err) {
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (admin?: AdminUser) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({ email: admin.email, password: '', role: admin.role });
    } else {
      setEditingAdmin(null);
      setFormData({ email: '', password: '', role: 'campus_admin' });
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAdmin) {
        const updated = await adminApi.updateAdmin(editingAdmin.id, {
          email: formData.email,
          password: formData.password || undefined
        });
        setAdmins((prev) => prev.map(a => a.id === updated.id ? updated : a));
        toast.success('Admin updated successfully');
      } else {
        const newAdmin = await adminApi.createAdmin(formData.email, formData.password);
        setAdmins((prev) => [newAdmin, ...prev]);
        toast.success('Admin created successfully');
      }
      setIsFormOpen(false);
      setFormData({ email: '', password: '', role: 'campus_admin' });
    } catch (err: any) {
      if (err.message?.includes('409') || err.message?.toLowerCase().includes('conflict') || err.message?.toLowerCase().includes('already exists')) {
        toast.error('An admin with this email already exists.');
      } else {
        toast.error(err.message ?? 'Failed to save admin');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!adminToDelete) return;
    try {
      await adminApi.deleteAdmin(adminToDelete.id);
      setAdmins((prev) => prev.filter(a => a.id !== adminToDelete.id));
      toast.success('Admin deleted successfully');
      setIsDeleteOpen(false);
      setAdminToDelete(null);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to delete admin');
    }
  };

  const columns = [
    {
      header: 'Email / Role',
      accessor: (a: AdminUser) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{a.email}</div>
          <div className="text-xs text-slate-500">{a.full_name ?? '—'}</div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (a: AdminUser) => (
        <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium border ${a.role === 'system_admin' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' : 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-800'}`}>
          <ShieldIcon size={12} />
          {a.role === 'system_admin' ? 'System Admin' : 'Campus Admin'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (a: AdminUser) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenForm(a)}
            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
            title="Edit Admin"
          >
            <Edit2Icon size={16} />
          </button>
          <button
            onClick={() => {
              setAdminToDelete(a);
              setIsDeleteOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Delete Admin"
          >
            <Trash2Icon size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Admins</h1>
          <p className="text-slate-500 dark:text-slate-400">Create and manage campus administrator accounts.</p>
        </div>
        <button onClick={() => handleOpenForm()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
          <PlusIcon size={18} /><span>New Admin</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : admins.length > 0 ? (
        <Table data={admins} columns={columns} keyExtractor={(a) => a.id} />
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">No admins created yet. Create one using the button above.</p>
        </div>
      )}

      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={editingAdmin ? "Edit Admin" : "Create New Admin"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="admin@campus.edu" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {editingAdmin ? "New Password (Optional)" : "Temporary Password"}
            </label>
            <input 
              required={!editingAdmin}
              type="password" 
              minLength={6} 
              autoComplete="new-password" 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              placeholder={editingAdmin ? "Leave blank to keep current" : "Min 6 characters"} 
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" 
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg transition-colors">
              {saving ? 'Saving...' : editingAdmin ? 'Update Admin' : 'Create Admin'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete ${adminToDelete?.email}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

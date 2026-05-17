import React, { useState, useEffect } from 'react';
import { Table } from '../../components/shared/Table';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { ShieldCheckIcon, ClockIcon, MessageSquareIcon, MapPinIcon, Trash2Icon } from 'lucide-react';
import * as adminApi from '../../api/admin';
import { toast } from 'sonner';

export function Feedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, [statusFilter]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getFeedback(statusFilter, 'building');
      setFeedback(data);
    } catch (err) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await adminApi.resolveFeedback(id);
      setFeedback(prev => prev.filter(f => f.id !== id));
      toast.success('Feedback resolved');
    } catch (err) {
      toast.error('Failed to resolve feedback');
    }
  };

  const handleDelete = async () => {
    if (!feedbackToDelete) return;
    try {
      await adminApi.deleteFeedback(feedbackToDelete.id);
      setFeedback(prev => prev.filter(f => f.id !== feedbackToDelete.id));
      toast.success('Feedback deleted');
      setIsDeleteOpen(false);
    } catch (err) {
      toast.error('Failed to delete feedback');
    }
  };

  const columns = [
    {
      header: 'Location',
      accessor: (f) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 dark:text-white">{f.building_name || 'Unknown'}</span>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPinIcon size={12} />
            {f.category}
          </div>
        </div>
      )
    },
    {
      header: 'Message',
      accessor: (f) => (
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate" title={f.message}>
          {f.message}
        </p>
      )
    },
    {
      header: 'Actions',
      accessor: (f) => (
        <div className="flex items-center gap-2">
          {f.status === 'pending' ? (
            <button
              onClick={() => handleResolve(f.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg transition-colors text-xs font-medium"
            >
              <ShieldCheckIcon size={14} />
              Resolve
            </button>
          ) : (
            <span className="text-xs text-emerald-600 font-medium px-2 py-1 bg-emerald-50 dark:bg-emerald-900/10 rounded-md">Resolved</span>
          )}

          <button
            onClick={() => {
              setFeedbackToDelete(f);
              setIsDeleteOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Delete Feedback"
          >
            <Trash2Icon size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Location Feedback</h1>
          <p className="text-slate-500 dark:text-slate-400">Review and resolve user-submitted feedback about campus locations.</p>
        </div>

        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm w-fit">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === 'pending' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <ClockIcon size={16} />
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === 'resolved' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <ShieldCheckIcon size={16} />
            Resolved
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : feedback.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <Table data={feedback} columns={columns} keyExtractor={(f) => f.id} />
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 mb-4 text-slate-400">
            <MessageSquareIcon size={24} />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No feedback found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {statusFilter === 'pending' ? "No pending feedback to address." : "No resolved feedback yet."}
          </p>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Feedback"
        message="Are you sure you want to delete this feedback? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}

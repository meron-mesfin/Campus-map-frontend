import React, { useState, useEffect } from 'react';
import { Table } from '../../components/shared/Table';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Trash2Icon, RefreshCwIcon, EraserIcon } from 'lucide-react';
import * as adminApi from '../../api/admin';
import { toast } from 'sonner';

interface ActivityLog {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  action: string;
  details: string;
}

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<ActivityLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getActivityLogs();
      setLogs(data);
    } catch (err) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async () => {
    if (!logToDelete) return;
    try {
      await adminApi.deleteActivityLog(logToDelete.id);
      setLogs(prev => prev.filter(l => l.id !== logToDelete.id));
      toast.success('Log entry deleted');
      setIsDeleteOpen(false);
    } catch (err) {
      toast.error('Failed to delete log');
    }
  };

  const handleClearLogs = async () => {
    try {
      await adminApi.clearActivityLogs();
      setLogs([]);
      toast.success('All logs cleared');
      setIsClearOpen(false);
    } catch (err) {
      toast.error('Failed to clear logs');
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === 'All' || log.action === filter;
    const matchesSearch = 
      (log.userName?.toLowerCase().includes(search.toLowerCase())) || 
      (log.details?.toLowerCase().includes(search.toLowerCase())) ||
      (log.userEmail?.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const columns = [
    {
      header: 'Timestamp',
      accessor: (log: ActivityLog) => (
        <span className="text-sm text-slate-500">
          {new Date(log.timestamp).toLocaleString()}
        </span>
      )
    }, 
    {
      header: 'User',
      accessor: (log: ActivityLog) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{log.userName || 'System'}</div>
          <div className="text-xs text-slate-500">{log.userEmail}</div>
        </div>
      )
    }, 
    {
      header: 'Action',
      accessor: (log: ActivityLog) => {
        const colors: Record<string, string> = {
          Login: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          Create: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
          Update: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
          Delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          Review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[log.action] || 'bg-slate-100 text-slate-600'}`}>
            {log.action}
          </span>
        );
      }
    }, 
    {
      header: 'Details',
      accessor: 'details' as keyof ActivityLog
    },
    {
      header: 'Actions',
      accessor: (log: ActivityLog) => (
        <button
          onClick={() => {
            setLogToDelete(log);
            setIsDeleteOpen(true);
          }}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          title="Delete Entry"
        >
          <Trash2Icon size={16} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Logs</h1>
          <p className="text-slate-500 dark:text-slate-400">Audit trail of all administrative actions in the system.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsClearOpen(true)}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
          >
            <EraserIcon size={16} />
            <span>Clear All</span>
          </button>
          <button 
            onClick={fetchLogs} 
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCwIcon size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Search logs..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" 
        />
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)} 
          className="w-full sm:w-48 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="All">All Actions</option>
          <option value="Login">Login</option>
          <option value="Create">Create</option>
          <option value="Update">Update</option>
          <option value="Delete">Delete</option>
          <option value="Review">Review</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <Table data={filteredLogs} columns={columns} keyExtractor={(l) => l.id} />
      )}

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteLog}
        title="Delete Log Entry"
        message="Are you sure you want to delete this specific log entry? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={isClearOpen}
        onClose={() => setIsClearOpen(false)}
        onConfirm={handleClearLogs}
        title="Clear All Logs"
        message="Are you sure you want to delete ALL activity logs? This will permanently erase the entire audit history."
        confirmText="Clear All"
        variant="danger"
      />
    </div>
  );
}
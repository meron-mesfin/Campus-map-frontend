import React, { useState } from 'react';
import { initialLogs, ActivityLog } from '../../data/mockData';
import { Table } from '../../components/shared/Table';
export function ActivityLogs() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const filteredLogs = initialLogs.filter((log) => {
    const matchesFilter = filter === 'All' || log.action === filter;
    const matchesSearch = log.userName.toLowerCase().includes(search.toLowerCase()) || log.details.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const columns = [{
    header: 'Timestamp',
    accessor: (log: ActivityLog) => <span className="text-sm text-slate-500">
          {new Date(log.timestamp).toLocaleString()}
        </span>
  }, {
    header: 'User',
    accessor: 'userName' as keyof ActivityLog,
    className: 'font-medium text-slate-900 dark:text-white'
  }, {
    header: 'Action',
    accessor: (log: ActivityLog) => {
      const colors: Record<string, string> = {
        Login: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        Create: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        Update: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
        Delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        Review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      };
      return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[log.action]}`}>
            {log.action}
          </span>;
    }
  }, {
    header: 'Details',
    accessor: 'details' as keyof ActivityLog
  }];
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Activity Logs
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Audit trail of all administrative actions in the system.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <input type="text" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full sm:w-48 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="All">All Actions</option>
          <option value="Login">Login</option>
          <option value="Create">Create</option>
          <option value="Update">Update</option>
          <option value="Delete">Delete</option>
          <option value="Review">Review</option>
        </select>
      </div>

      <Table data={filteredLogs} columns={columns} keyExtractor={(l) => l.id} />
    </div>;
}
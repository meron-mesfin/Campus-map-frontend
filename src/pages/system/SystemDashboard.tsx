import React from 'react';
import { StatsCard } from '../../components/shared/StatsCard';
import { UsersIcon, ShieldIcon, ActivityIcon, AlertCircleIcon } from 'lucide-react';
import { initialAdmins, initialLogs } from '../../data/mockData';
export function SystemDashboard() {
  const activeAdmins = initialAdmins.filter((a) => a.status === 'Active').length;
  const recentLogs = initialLogs.slice(0, 5);
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          System Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Monitor system health and administrative activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Admins" value={initialAdmins.length} icon={UsersIcon} color="primary" />
        <StatsCard title="Active Sessions" value={activeAdmins} icon={ShieldIcon} color="green" />
        <StatsCard title="System Actions (24h)" value={124} icon={ActivityIcon} color="purple" trend={{
        value: 8,
        isPositive: true
      }} />
        <StatsCard title="System Alerts" value={0} icon={AlertCircleIcon} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Recent Activity
            </h2>
            <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentLogs.map((log) => <div key={log.id} className="flex gap-4 items-start">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.action === 'Delete' ? 'bg-red-500' : log.action === 'Create' ? 'bg-emerald-500' : log.action === 'Update' ? 'bg-primary-500' : 'bg-slate-400'}`} />
                <div>
                  <p className="text-sm text-slate-900 dark:text-white font-medium">
                    {log.details}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    By {log.userName} •{' '}
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group">
              <UsersIcon className="text-primary-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="font-medium text-slate-900 dark:text-white">
                Add New Admin
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Create a new administrator account
              </p>
            </button>
            <button className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group">
              <ShieldIcon className="text-emerald-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="font-medium text-slate-900 dark:text-white">
                Role Permissions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Review and update access levels
              </p>
            </button>
            <button className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group">
              <ActivityIcon className="text-purple-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="font-medium text-slate-900 dark:text-white">
                Export Logs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Download system activity history
              </p>
            </button>
            <button className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group">
              <AlertCircleIcon className="text-amber-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="font-medium text-slate-900 dark:text-white">
                System Health
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Run diagnostics and checks
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>;
}
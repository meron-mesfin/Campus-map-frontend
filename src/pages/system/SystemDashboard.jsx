import React, { useEffect, useState } from 'react';
import { StatsCard } from '../../components/shared/StatsCard';
import { MapPinIcon, MessageSquareIcon, UsersIcon, ShieldIcon } from 'lucide-react';
import * as adminApi from '../../api/admin';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

export function SystemDashboard() {
  const [reports, setReports] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getReports(), adminApi.getAnalytics()])
      .then(([r, a]) => { setReports(r); setAnalytics(a); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Platform-wide statistics and health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Buildings" value={reports?.totalBuildings ?? 0} icon={MapPinIcon} color="primary" />
        <StatsCard title="Total Feedback" value={reports?.totalFeedback ?? 0} icon={MessageSquareIcon} color="amber" />
        <StatsCard title="Pending Reviews" value={reports?.pendingFeedback ?? 0} icon={ShieldIcon} color="green" />
        <StatsCard title="Active Users" value={reports?.activeUsers ?? 0} icon={UsersIcon} color="purple" />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Searches</h2>
        {analytics?.topSearches?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analytics.topSearches.map((s, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-900 dark:text-white">{s.query}</span>
                <span className="text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-0.5 rounded-full">{s.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">No search data yet.</p>
        )}
      </div>
    </div>
  );
}

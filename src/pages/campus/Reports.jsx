import React, { useEffect, useState } from 'react';
import { getReports, getAnalytics } from '../../api/admin';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { toast } from 'sonner';

export function Reports() {
  const [reports, setReports] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getReports(), getAnalytics()])
      .then(([r, a]) => { setReports(r); setAnalytics(a); })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Campus Reports</h1>
        <p className="text-slate-500 dark:text-slate-400">Overview of campus activity and statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Buildings', value: reports?.totalBuildings ?? 0 },
          { label: 'Total Feedback', value: reports?.totalFeedback ?? 0 },
          { label: 'Pending Feedback', value: reports?.pendingFeedback ?? 0 },
          { label: 'Active Users', value: reports?.activeUsers ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Most Favorited Buildings</h2>
          {analytics?.topFavorites?.length ? (
            <div className="space-y-3">
              {analytics.topFavorites.map((b, i) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400 w-5">#{i + 1}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{b.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">{b.count} favorites</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400 text-center py-4">No data available</p>}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Buildings by Category</h2>
          {analytics?.buildingsByCategory?.length ? (
            <div className="space-y-3">
              {analytics.buildingsByCategory.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{c.category ?? 'Unknown'}</span>
                  <span className="text-xs text-slate-500">{c.count} buildings</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400 text-center py-4">No data available</p>}
        </div>
      </div>
    </div>
  );
}

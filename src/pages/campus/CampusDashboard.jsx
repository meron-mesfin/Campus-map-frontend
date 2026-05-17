import React, { useEffect, useState } from 'react';
import { StatsCard } from '../../components/shared/StatsCard';
import { MapPinIcon, MessageSquareIcon, UsersIcon, LayoutGridIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as adminApi from '../../api/admin';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

export function CampusDashboard() {
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

  const categoryChartData = analytics?.buildingsByCategory?.map((c) => ({
    name: c.category ?? 'Unknown',
    count: Number(c.count),
  })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Campus Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back. Here's what's happening on campus today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Locations" value={reports?.totalBuildings ?? 0} icon={MapPinIcon} color="primary" />
        <StatsCard title="Total Rooms"     value={reports?.totalRooms ?? 0}     icon={LayoutGridIcon} color="green" />
        <StatsCard title="Pending Feedback" value={reports?.pendingFeedback ?? 0} icon={MessageSquareIcon} color="amber" />
        <StatsCard title="Active Users"    value={reports?.activeUsers ?? 0}    icon={UsersIcon} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Buildings by Category</h2>
          <div className="h-72">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#00a651" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Searches</h2>
          <div className="space-y-3">
            {analytics?.topSearches?.length ? (
              analytics.topSearches.map((s, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{s.query}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{s.count} searches</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No search data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

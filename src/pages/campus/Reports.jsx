import React, { useEffect, useState } from 'react';
import { getReports, getAnalytics } from '../../api/admin';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { toast } from 'sonner';

export function Reports() {
  const [reports, setReports] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [rangeType, setRangeType] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const getDateRangeParams = () => {
    if (rangeType === 'all') return { startDate: '', endDate: '' };
    
    const now = new Date();
    let start = new Date();
    
    if (rangeType === 'week') {
      const day = now.getDay();
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
    } else if (rangeType === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (rangeType === '30days') {
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    } else if (rangeType === 'custom') {
      return { 
        startDate: customStart ? `${customStart}T00:00:00` : '', 
        endDate: customEnd ? `${customEnd}T23:59:59` : '' 
      };
    }
    
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${date}`;
    };

    return { 
      startDate: `${formatDate(start)}T00:00:00`, 
      endDate: `${formatDate(now)}T23:59:59` 
    };
  };

  const loadData = async (isFirst = false) => {
    try {
      if (isFirst) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const { startDate, endDate } = getDateRangeParams();
      const [r, a] = await Promise.all([
        getReports(startDate, endDate),
        getAnalytics(startDate, endDate)
      ]);
      setReports(r);
      setAnalytics(a);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setFirstLoad(false);
    }
  };

  useEffect(() => {
    loadData(firstLoad);
  }, [rangeType, customStart, customEnd]);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      {/* Header & Date Range Filter Container */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Campus Reports</h1>
          <p className="text-slate-500 dark:text-slate-400">Overview of campus activity and statistics.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Timeframe:</span>
            <select
              value={rangeType}
              onChange={(e) => setRangeType(e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0d6a49] outline-none transition-shadow"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {rangeType === 'custom' && (
            <div className="flex items-center gap-2 animate-fadeIn">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0d6a49] outline-none"
              />
              <span className="text-slate-400 text-xs font-medium">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0d6a49] outline-none"
              />
            </div>
          )}

          {refreshing && (
            <span className="text-xs text-[#0d6a49] dark:text-emerald-400 flex items-center gap-1 font-medium animate-pulse ml-2">
              🔄 Updating...
            </span>
          )}
        </div>
      </div>

      {/* Grid of Key Statistics Card Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Total Buildings', value: reports?.totalBuildings ?? 0 },
          { label: 'Total Feedback', value: reports?.totalFeedback ?? 0 },
          { label: 'Pending Feedback', value: reports?.pendingFeedback ?? 0 },
          { label: 'Total Rooms', value: reports?.totalRooms ?? 0 },
          { label: 'Registered Users', value: reports?.activeUsers ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-all duration-300 hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{stat.label}</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Favorited Buildings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Most Favorited Buildings</h2>
          {analytics?.topFavorites?.length ? (
            <div className="space-y-3">
              {analytics.topFavorites.map((b, i) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400 w-5">#{i + 1}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{b.name}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300">
                    {b.count} favorites
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400 text-center py-4">No data available</p>}
        </div>

        {/* Top Searched Queries */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top Searched Queries</h2>
          {analytics?.topSearches?.length ? (
            <div className="space-y-3">
              {analytics.topSearches.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400 w-5">#{i + 1}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">"{s.query}"</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    {s.count} searches
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400 text-center py-4">No data available</p>}
        </div>

        {/* Buildings by Category */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Buildings by Category</h2>
          {analytics?.buildingsByCategory?.length ? (
            <div className="space-y-3">
              {analytics.buildingsByCategory.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{c.category ?? 'Unknown'}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                    {c.count} buildings
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400 text-center py-4">No data available</p>}
        </div>
      </div>
    </div>
  );
}

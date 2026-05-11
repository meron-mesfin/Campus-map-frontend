import React from 'react';
import { StatsCard } from '../../components/shared/StatsCard';
import { MapPinIcon, MessageSquareIcon, SearchIcon, UsersIcon } from 'lucide-react';
import { initialLocations, initialFeedback, chartData } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export function CampusDashboard() {
  const unreviewedFeedback = initialFeedback.filter((f) => !f.reviewed).length;
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Campus Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Welcome back. Here's what's happening on campus today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Locations" value={initialLocations.length} icon={MapPinIcon} color="primary" trend={{
        value: 12,
        isPositive: true
      }} />
        <StatsCard title="Pending Feedback" value={unreviewedFeedback} icon={MessageSquareIcon} color="amber" />
        <StatsCard title="Total Searches (Month)" value="8,500" icon={SearchIcon} color="green" trend={{
        value: 18,
        isPositive: true
      }} />
        <StatsCard title="Active Users" value="1,240" icon={UsersIcon} color="purple" trend={{
        value: 5,
        isPositive: true
      }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Search Activity Trends
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.searchesOverTime.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{
                fill: '#64748b'
              }} />
                <YAxis axisLine={false} tickLine={false} tick={{
                fill: '#64748b'
              }} />
                <Tooltip cursor={{
                fill: '#f1f5f9',
                opacity: 0.1
              }} contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }} />
                <Bar dataKey="searches" fill="#00a651" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Recent Feedback
          </h2>
          <div className="space-y-4">
            {initialFeedback.slice(0, 4).map((feedback) => {
            const location = initialLocations.find((l) => l.id === feedback.locationId);
            return <div key={feedback.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-slate-900 dark:text-white">
                      {location?.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-amber-500 font-bold">
                      ★ {feedback.rating}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {feedback.comment}
                  </p>
                </div>;
          })}
          </div>
        </div>
      </div>
    </div>;
}
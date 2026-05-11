import React, { useState } from 'react';
import { chartData } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
const COLORS = ['#00a651', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];
export function Reports() {
  const [timeRange, setTimeRange] = useState('6m');
  const filteredSearches = timeRange === '6m' ? chartData.searchesOverTime.slice(-6) : chartData.searchesOverTime;
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Data Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Analyze campus usage and feedback metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Searches Line Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Location Searches Over Time
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredSearches}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{
                fill: '#64748b'
              }} />
                <YAxis axisLine={false} tickLine={false} tick={{
                fill: '#64748b'
              }} />
                <Tooltip contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }} itemStyle={{
                color: '#fff'
              }} />
                <Line type="monotone" dataKey="searches" stroke="#00a651" strokeWidth={3} dot={{
                r: 4,
                fill: '#00a651'
              }} activeDot={{
                r: 6
              }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Locations by Type Bar Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Locations by Type
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.locationsByType} layout="vertical" margin={{
              left: 20
            }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{
                fill: '#64748b'
              }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{
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
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24}>
                  {chartData.locationsByType.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Ratings Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Feedback Ratings Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData.feedbackRatings.filter((d) => d.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.feedbackRatings.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>;
}
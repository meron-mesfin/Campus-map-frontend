import React from 'react';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary'
}) {
  const colorStyles = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
  };
  return <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
          <Icon size={24} />
        </div>
      </div>

      {trend && <div className="mt-4 flex items-center text-sm">
          <span className={`flex items-center font-medium ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend.isPositive ? <TrendingUpIcon size={16} className="mr-1" /> : <TrendingDownIcon size={16} className="mr-1" />}
            {trend.value}%
          </span>
          <span className="text-slate-500 dark:text-slate-400 ml-2">
            vs last month
          </span>
        </div>}
    </div>;
}

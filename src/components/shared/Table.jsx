import React from 'react';

export function Table({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No records found',
  onRowClick
}) {
  return <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
          <tr>
            {columns.map((col, i) => <th key={i} className={`px-6 py-4 font-semibold ${col.className || ''}`}>
                {col.header}
              </th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {data.length === 0 ? <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                {emptyMessage}
              </td>
            </tr> : data.map((item) => <tr 
                key={keyExtractor(item)} 
                onClick={() => onRowClick?.(item)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50' : ''}`}
              >
                {columns.map((col, i) => <td key={i} className={`px-6 py-4 whitespace-nowrap ${col.className || ''}`}>
                    {typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor]}
                  </td>)}
              </tr>)}
        </tbody>
      </table>
    </div>;
}

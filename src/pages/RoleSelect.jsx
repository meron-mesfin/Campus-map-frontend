import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapIcon, ShieldIcon, BuildingIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export function RoleSelect() {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6 flex items-center gap-2 text-primary-600 dark:text-primary-400">
        <MapIcon size={32} />
        <span className="text-xl font-bold text-slate-900 dark:text-white">
          DMU Maps
        </span>
      </div>

      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome to DMU Campus Map System
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Please select your administrative role to continue
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.button whileHover={{
          scale: 1.02,
          y: -5
        }} whileTap={{
          scale: 0.98
        }} onClick={() => navigate('/campus')} className="flex flex-col items-center p-10 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 transition-colors group text-left">
            <div className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-6 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
              <BuildingIcon size={40} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Campus Administrator
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-center">
              Manage campus locations, view user feedback, and analyze
              location-specific data reports.
            </p>
          </motion.button>

          <motion.button whileHover={{
          scale: 1.02,
          y: -5
        }} whileTap={{
          scale: 0.98
        }} onClick={() => navigate('/system')} className="flex flex-col items-center p-10 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors group text-left">
            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-6 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
              <ShieldIcon size={40} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              System Administrator
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-center">
              Manage user accounts, assign roles, and view system-wide activity
              logs and reports.
            </p>
          </motion.button>
        </div>
      </div>
    </div>;
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  Loader2Icon } from
'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MoonIcon, SunIcon } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    // Simulate network delay for realism
    await new Promise((resolve) => setTimeout(resolve, 800));
    const result = await login(email, password);
    setIsLoading(false);
    if (result.success) {
      const savedUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
      if (savedUser.role === 'system_admin') {
        navigate('/system', { replace: true });
      } else {
        navigate('/campus', { replace: true });
      }
    } else {
      setError(result.error || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        title="Toggle theme">
        
        {isDark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
      </button>

      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.4
        }}
        className="w-full max-w-md">
        
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center">
            <MapIcon size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              DMU Maps
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Campus Map System
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-[Inter,_sans-serif]">
              Welcome back
            </h2>
          </div>

          {/* Error Message */}
          {error &&
          <motion.div
            initial={{
              opacity: 0,
              y: -10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
            <AlertCircleIcon size={18} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <span className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</span>
          </motion.div>
          }

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <MailIcon
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                
                <input
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@dmu.ac.uk"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <LockIcon
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  
                  {showPassword ?
                  <EyeOffIcon size={18} /> :

                  <EyeIcon size={18} />
                  }
                </button>
              </div>
            </div>

            {/* Remember me & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                
                Remember me
              </label>
              <button
                type="button"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              
              {isLoading ?
              <>
                  <Loader2Icon size={18} className="animate-spin" />
                  Signing in...
                </> :

              'Sign In'
              }
            </button>
          </form>
        </div>
      </motion.div>
    </div>);

}

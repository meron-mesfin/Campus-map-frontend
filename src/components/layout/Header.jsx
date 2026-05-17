import { useEffect, useState, useRef } from 'react';
import {
  MenuIcon,
  BellIcon,
  SearchIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  ShieldCheckIcon,
  MailIcon,
  BadgeCheckIcon,
  ClockIcon,
  LogOutIcon,
  BuildingIcon,
  AlertCircleIcon,
  MessageSquareIcon,
  MapPinIcon } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { displayRole } from '../../utils/roles';
import { useLocation } from 'react-router-dom';
import { getFeedback } from '../../api/admin';

export function Header({ toggleSidebar, role }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
      profileRef.current &&
      !profileRef.current.contains(e.target))
      {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Generate simple breadcrumb from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageName =
  pathParts.length > 1 ?
  pathParts[pathParts.length - 1].charAt(0).toUpperCase() +
  pathParts[pathParts.length - 1].slice(1) :
  'Dashboard';
  // Get initials for avatar — safe against undefined / empty name
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  // Format last login
  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };
  const isSystemAdmin = user?.role === 'system_admin';
  const roleLabel = user ? displayRole(user.role) : '';
  const roleColor = isSystemAdmin ?
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
  'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border-primary-200 dark:border-primary-800';
  // Fetch real notifications
  const [realNotifications, setRealNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        if (isSystemAdmin) {
           const feedback = await getFeedback('pending', 'system');
           const mapped = feedback.slice(0, 5).map((f) => ({
             id: f.id,
             icon: MessageSquareIcon,
             title: 'System Feedback',
             desc: f.message.length > 40 ? f.message.substring(0, 40) + '...' : f.message,
             time: formatDate(f.created_at),
             color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
             link: '/system/feedback'
           }));
           setRealNotifications(mapped);
           setUnreadCount(feedback.length);
        } else {
           const feedback = await getFeedback('pending');
           const mapped = feedback.slice(0, 5).map((f) => ({
             id: f.id,
             icon: MessageSquareIcon,
             title: f.type === 'building' && f.building_name ? `Feedback on ${f.building_name}` : 'New Feedback',
             desc: f.message.length > 40 ? f.message.substring(0, 40) + '...' : f.message,
             time: formatDate(f.created_at),
             color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
             link: '/campus/feedback'
           }));
           setRealNotifications(mapped);
           setUnreadCount(feedback.length);
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    
    if (user) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000); // refresh every 30s
      return () => clearInterval(interval);
    }
  }, [user, isSystemAdmin]);

  const notifications = realNotifications.length > 0 ? realNotifications : (isSystemAdmin ?
  [
  {
    id: 1,
    icon: AlertCircleIcon,
    title: 'No new notifications',
    desc: 'You are all caught up!',
    time: '',
    color: 'text-slate-600 bg-slate-50 dark:bg-slate-900/30'
  }] :

  [
  {
    id: 1,
    icon: MessageSquareIcon,
    title: 'No new feedback',
    desc: 'You have no pending feedback to review.',
    time: '',
    color: 'text-slate-600 bg-slate-50 dark:bg-slate-900/30'
  }]);

  const handleLogout = () => {
    logout();
    navigate('/login', {
      replace: true
    });
  };
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
          
          <MenuIcon size={20} />
        </button>

        <div className="hidden md:flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
          <span className="text-slate-400 dark:text-slate-500">{role}</span>
          <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
          <span>{pageName}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden md:block">
          <SearchIcon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent rounded-lg text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all w-64 dark:text-white" />
          
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title="Toggle theme">
          
          {isDark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
        </button>

        {/* Notifications dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen((o) => !o);
              setIsProfileOpen(false);
            }}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications">
            
            <BellIcon size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen &&
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
                scale: 0.98
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{
                opacity: 0,
                y: -8,
                scale: 0.98
              }}
              transition={{
                duration: 0.15
              }}
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
              
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Notifications
                  </h3>
                  <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                    {unreadCount} new
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) =>
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.link) {
                      navigate(n.link);
                      setIsNotifOpen(false);
                    }
                  }}
                  className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                  
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${n.color} shrink-0`}>
                          <n.icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {n.desc}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    </div>
                )}
                </div>
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => {
                      navigate(isSystemAdmin ? '/system/feedback' : '/campus/feedback');
                      setIsNotifOpen(false);
                    }}
                    className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>

        {/* User avatar with profile dropdown */}
        <div className="relative ml-2" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen((o) => !o);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Account info">
            
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-slate-200 dark:border-slate-700">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                initials || <UserIcon size={16} />
              )}
            </div>
            <span className="hidden lg:block text-sm font-medium text-slate-700 dark:text-slate-200">
              {displayName}
            </span>
          </button>

          <AnimatePresence>
            {isProfileOpen && user &&
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
                scale: 0.98
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{
                opacity: 0,
                y: -8,
                scale: 0.98
              }}
              transition={{
                duration: 0.15
              }}
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
              
                {/* Profile header */}
                <div className="px-4 py-4 bg-gradient-to-br from-primary-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-base font-bold shrink-0 overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
                      {user?.profile_picture ? (
                        <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {displayName}
                      </p>
                      <span
                      className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${roleColor}`}>
                      
                        {isSystemAdmin ?
                      <ShieldCheckIcon size={10} /> :

                      <BadgeCheckIcon size={10} />
                      }
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile details */}
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-start gap-3">
                    <MailIcon
                    size={16}
                    className="text-slate-400 mt-0.5 shrink-0" />
                  
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
                        Email
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BadgeCheckIcon
                    size={16}
                    className="text-slate-400 mt-0.5 shrink-0" />
                  
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
                        Status
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <span
                        className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                      </span>
                        {user.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ClockIcon
                    size={16}
                    className="text-slate-400 mt-0.5 shrink-0" />
                  
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
                        Last Login
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        {formatDate(user.lastLogin)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheckIcon
                    size={16}
                    className="text-slate-400 mt-0.5 shrink-0" />
                  
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
                        Permissions
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        {isSystemAdmin ?
                      'Full system access · Manage admins · View all logs' :
                      'Manage locations, staff & feedback for assigned campus'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-200 dark:border-slate-800 p-2 flex flex-col gap-1">
                  <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  
                    Account settings
                  </button>
                  <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2">
                  
                    <LogOutIcon size={14} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>
    </header>);

}

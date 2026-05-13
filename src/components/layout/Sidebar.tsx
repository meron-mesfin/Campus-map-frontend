import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  MapPinIcon,
  MessageSquareIcon,
  BarChart3Icon,
  UsersIcon,
  SettingsIcon,
  ActivityIcon,
  LogOutIcon,
  MapIcon } from
'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/admin';

interface SidebarProps {
  role: 'Campus Admin' | 'System Admin';
  isCollapsed: boolean;
}

export function Sidebar({ role, isCollapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (role === 'System Admin') {
      adminApi.getFeedback('pending', 'system')
        .then(data => setPendingCount(data.length))
        .catch(console.error);
    }
  }, [location.pathname, role]);

  const campusNav = [
  {
    name: 'Dashboard',
    path: '/campus',
    icon: LayoutDashboardIcon
  },
  {
    name: 'Locations',
    path: '/campus/locations',
    icon: MapPinIcon
  },
  {
    name: 'Staff',
    path: '/campus/staff',
    icon: UsersIcon
  },
  {
    name: 'Feedback',
    path: '/campus/feedback',
    icon: MessageSquareIcon
  },
  {
    name: 'Reports',
    path: '/campus/reports',
    icon: BarChart3Icon
  }];

  const systemNav = [
  {
    name: 'Dashboard',
    path: '/system',
    icon: LayoutDashboardIcon
  },
  {
    name: 'Manage Admins',
    path: '/system/admins',
    icon: UsersIcon
  },
  {
    name: 'Activity Logs',
    path: '/system/logs',
    icon: ActivityIcon
  },
  {
    name: 'System Feedback',
    path: '/system/feedback',
    icon: MessageSquareIcon,
    badge: pendingCount > 0 ? pendingCount : undefined
  },
  {
    name: 'System Reports',
    path: '/system/reports',
    icon: BarChart3Icon
  }];

  const navItems = role === 'Campus Admin' ? campusNav : systemNav;
  const handleLogout = () => {
    logout();
    navigate('/login', {
      replace: true
    });
  };
  return (
    <aside
      className={`bg-primary-50/60 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-r border-primary-100 dark:border-slate-800 flex flex-col transition-all duration-300 z-20 ${isCollapsed ? 'w-20' : 'w-64'} h-screen sticky top-0`}>
      
      <div className="h-16 flex items-center justify-center border-b border-primary-100 dark:border-slate-800 px-4">
        <MapIcon
          className="text-primary-600 dark:text-primary-500 shrink-0"
          size={28} />
        
        {!isCollapsed &&
        <span className="ml-3 font-bold text-slate-900 dark:text-white text-lg whitespace-nowrap overflow-hidden">
            DMU Maps
          </span>
        }
      </div>

      <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto overflow-x-hidden">
        {!isCollapsed &&
        <div className="px-3 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
            {role}
          </div>
        }

        {navItems.map((item: any) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group relative ${isActive ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:bg-primary-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              title={isCollapsed ? item.name : undefined}>
              
              <item.icon
                size={20}
                className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-primary-700 dark:group-hover:text-white'}`} />
              
              {!isCollapsed &&
                <span className="ml-3 whitespace-nowrap flex-1">{item.name}</span>
              }

              {item.badge && (
                <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-primary-600' : 'bg-primary-600 text-white'} ${isCollapsed ? 'absolute top-1 right-1' : 'ml-2'}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>);

        })}

        <div className="mt-auto pt-6 border-t border-primary-100 dark:border-slate-800 flex flex-col gap-2">
          {/* User info */}
          {!isCollapsed && user &&
          <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user.name || user.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user.email}
              </p>
            </div>
          }

          <NavLink
            to="/settings"
            className={({ isActive }) =>
            `flex items-center px-3 py-2.5 rounded-lg transition-colors group ${isActive ? 'bg-primary-100 text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-primary-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`
            }
            title={isCollapsed ? 'Settings' : undefined}>
            
            <SettingsIcon
              size={20}
              className="shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-primary-700 dark:group-hover:text-white" />
            
            {!isCollapsed &&
            <span className="ml-3 whitespace-nowrap">Settings</span>
            }
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2.5 rounded-lg transition-colors group hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 text-slate-600 dark:text-slate-400 w-full"
            title={isCollapsed ? 'Logout' : undefined}>
            
            <LogOutIcon size={20} className="shrink-0" />
            {!isCollapsed &&
            <span className="ml-3 whitespace-nowrap">Logout</span>
            }
          </button>
        </div>
      </div>
    </aside>);
}
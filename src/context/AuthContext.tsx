import React, { useCallback, useState, createContext, useContext } from 'react';
import * as authApi from '../api/auth';
import { clearToken, getToken } from '../api/client';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  role: 'system_admin' | 'campus_admin' | 'user';
  status?: 'Active' | 'Inactive';
  lastLogin?: string;
  profile_picture?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updatedUser: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (!getToken()) return null;
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try { return JSON.parse(saved) as AuthUser; }
      catch { return null; }
    }
    return null;
  });

  const login = useCallback(async (email: string, password: string) => {
    try {
      const authUser = await authApi.login(email, password);
      if (authUser.role !== 'system_admin' && authUser.role !== 'campus_admin') {
        clearToken();
        return { success: false, error: 'Access denied. This portal is for administrators only.' };
      }
      setUser(authUser);
      localStorage.setItem('auth_user', JSON.stringify(authUser));
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Login failed.' };
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

// Re-exported from utils/roles so existing imports from AuthContext still work
export { displayRole } from '../utils/roles';

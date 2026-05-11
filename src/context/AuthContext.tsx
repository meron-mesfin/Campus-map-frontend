import React, { useCallback, useState, createContext, useContext } from 'react';
import { initialAdmins, Admin } from '../data/mockData';
interface AuthContextType {
  user: Admin | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => {
    success: boolean;
    error?: string;
  };
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({
  children


}: {children: React.ReactNode;}) {
  const [user, setUser] = useState<Admin | null>(() => {
    // Check for persisted session
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const login = useCallback((email: string, password: string) => {
    const found = initialAdmins.find((a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (!found) {
      return {
        success: false,
        error: 'Invalid email or password.'
      };
    }
    if (found.status === 'Inactive') {
      return {
        success: false,
        error: 'This account has been deactivated. Contact a System Administrator.'
      };
    }
    setUser(found);
    localStorage.setItem('auth_user', JSON.stringify(found));
    return {
      success: true
    };
  }, []);
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_user');
  }, []);
  return <AuthContext.Provider value={{
    user,
    isAuthenticated: !!user,
    login,
    logout
  }}>
      {children}
    </AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
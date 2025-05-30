
"use client";

import type { UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('userRole') as UserRole | null;
      if (storedRole) {
        setUserRole(storedRole);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
    setIsLoading(false);
  }, []);

  const login = (role: UserRole) => {
    try {
      localStorage.setItem('userRole', role);
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
    setUserRole(role);
    setIsAuthenticated(true);
    switch (role) {
      case 'admin':
        router.push('/admin/dashboard');
        break;
      case 'student':
        router.push('/student/profile');
        break;
      case 'staff':
        router.push('/staff/profile');
        break;
      default:
        router.push('/login');
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('userRole');
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
    setUserRole(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

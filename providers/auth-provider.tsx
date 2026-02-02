'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from '@/i18n/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'member' | 'executive';
  status: 'active' | 'suspended' | 'inactive';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Verify token with backend
      // Mock user for now
      setUser({
        id: '1',
        email: 'admin@itesiwaju.com',
        firstName: 'Adebayo',
        lastName: 'Okon',
        role: 'admin',
        status: 'active',
      });
    }
    setIsLoading(false);
  }

  async function login(email: string, password: string) {
    // TODO: Implement API call
    const mockUser: User = {
      id: '1',
      email,
      firstName: 'Adebayo',
      lastName: 'Okon',
      role: 'admin',
      status: 'active',
    };
    
    localStorage.setItem('token', 'mock-jwt-token');
    setUser(mockUser);
    router.push('/dashboard');
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

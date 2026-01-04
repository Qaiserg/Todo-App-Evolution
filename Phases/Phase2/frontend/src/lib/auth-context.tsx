'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signUp, signOut, authClient } from './auth-client';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending: loading } = useSession();

  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    createdAt: new Date(session.user.createdAt),
  } : null;

  const login = async (email: string, password: string) => {
    const result = await signIn.email({ email, password });
    if (result.error) {
      throw new Error(result.error.message || 'Login failed');
    }
  };

  const register = async (email: string, name: string, password: string) => {
    const result = await signUp.email({ email, password, name });
    if (result.error) {
      throw new Error(result.error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    await signOut();
  };

  const getToken = async (): Promise<string | null> => {
    try {
      const { data } = await authClient.getSession();
      if (data?.session) {
        // Get JWT token from Better Auth
        const tokenResponse = await fetch('/api/auth/token', {
          method: 'GET',
          credentials: 'include',
        });
        if (tokenResponse.ok) {
          const { token } = await tokenResponse.json();
          return token;
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

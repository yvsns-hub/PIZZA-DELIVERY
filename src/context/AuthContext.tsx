import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types.js';
import { api } from '../services/api.js';

export type AuthState = 'checking' | 'unauthenticated' | 'authenticated' | 'error';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  authState: AuthState;
  isLoading: boolean;
  login: (email: string, password: string, expectedRole?: 'customer' | 'delivery') => Promise<{ requiresOtp?: boolean; email?: string }>;
  verifyLoginOtp: (email: string, otp: string, expectedRole?: 'customer' | 'delivery') => Promise<User>;
  resendOtp: (email: string, type?: 'login' | 'signup') => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<User>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
  logout: () => void;
  switchDemoUser: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pizza_auth_token'));
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>(() => {
    return localStorage.getItem('pizza_auth_token') ? 'checking' : 'unauthenticated';
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !!localStorage.getItem('pizza_auth_token');
  });

  const role: UserRole | null = user?.role || null;

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setAuthState('unauthenticated');
      setIsLoading(false);
      return;
    }

    setAuthState('checking');
    setIsLoading(true);

    try {
      const data = await api.getMe();
      setUser(data.user);
      setAuthState('authenticated');
    } catch {
      localStorage.removeItem('pizza_auth_token');
      setToken(null);
      setUser(null);
      setAuthState('unauthenticated');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  // Login step 1: Validates credentials and triggers email OTP
  const login = async (email: string, password: string, expectedRole?: 'customer' | 'delivery') => {
    const res = await api.login(email, password, expectedRole);
    return res;
  };

  // Login step 2: Verifies OTP code and establishes authenticated session
  const verifyLoginOtp = async (email: string, otp: string, expectedRole?: 'customer' | 'delivery'): Promise<User> => {
    const res = await api.verifyLoginOtp(email, otp, expectedRole);
    localStorage.setItem('pizza_auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthState('authenticated');
    return res.user;
  };

  const resendOtp = async (email: string, type?: 'login' | 'signup') => {
    await api.resendOtp(email, type);
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.register(data);
    if (res.token) {
      localStorage.setItem('pizza_auth_token', res.token);
      setToken(res.token);
    }
    if (res.user) {
      setUser(res.user);
    }
  };

  const verifyEmail = async (email: string, code: string): Promise<User> => {
    const res = await api.verifyEmail(email, code);
    if (res.token) {
      localStorage.setItem('pizza_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setAuthState('authenticated');
    }
    return res.user;
  };

  const updateProfile = async (data: { name?: string; phone?: string }) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('pizza_auth_token');
    setToken(null);
    setUser(null);
    setAuthState('unauthenticated');
  };

  const switchDemoUser = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      if (targetRole === 'admin') {
        await login('yvsns7035@gmail.com', '@Chirutha7035');
      } else if (targetRole === 'delivery') {
        await login('delivery1@pizzadelivery.com', 'Delivery@12345', 'delivery');
      } else {
        await login('customer@example.com', 'Customer@12345', 'customer');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        authState,
        isLoading,
        login,
        verifyLoginOtp,
        resendOtp,
        register,
        verifyEmail,
        updateProfile,
        logout,
        switchDemoUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

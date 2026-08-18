import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginWithGoogle: (credential?: string, customUser?: Partial<User>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('reachinbox_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const loginWithGoogle = async (credential?: string, customUser?: Partial<User>) => {
    try {
      const res = await authAPI.googleLogin(credential, customUser);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('reachinbox_user', JSON.stringify(res.user));
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback demo user if backend request fails
      const fallbackUser: User = {
        id: 'demo-id',
        email: customUser?.email || 'demo@reachinbox.ai',
        name: customUser?.name || 'ReachInbox Demo User',
        avatar: customUser?.avatar || 'https://lh3.googleusercontent.com/a/default-user',
      };
      setUser(fallbackUser);
      localStorage.setItem('reachinbox_user', JSON.stringify(fallbackUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('reachinbox_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithGoogle,
        logout,
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

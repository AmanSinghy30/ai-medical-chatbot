import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { loginUser, registerUser, getProfile } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('medisage_token'));
  const [loading, setLoading] = useState(true);

  const transformUser = (data: any): User => ({
    id: data._id || data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    age: data.age,
    gender: data.gender,
    allergies: data.allergies || [],
    chronicConditions: data.chronicConditions || [],
    avatar: data.avatar,
  });

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await getProfile();
      setUser(transformUser(data));
    } catch (error) {
      console.error('Failed to refresh user', error);
      logout();
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem('medisage_token');
      if (savedToken) {
        setToken(savedToken);
        try {
          await refreshUser();
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    init();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { data } = await loginUser({ email, password });
    localStorage.setItem('medisage_token', data.token);
    setToken(data.token);
    setUser(transformUser(data));
  };

  const register = async (userData: any) => {
    const { data } = await registerUser(userData);
    localStorage.setItem('medisage_token', data.token);
    setToken(data.token);
    setUser(transformUser(data));
  };

  const logout = () => {
    localStorage.removeItem('medisage_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

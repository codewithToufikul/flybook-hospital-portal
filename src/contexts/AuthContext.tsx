import React, { createContext, useContext, useState, useEffect } from 'react';
import { Hospital } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  hospital: Hospital | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  updateHospital: (hospital: Hospital) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hospital_portal_token'));
  const [loading, setLoading] = useState(true);

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('hospital_portal_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hospital_portal_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('hospital_portal_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.hospital) {
          setHospital(res.hospital);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session expired or error:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    if (res.success && res.token && res.hospital) {
      localStorage.setItem('hospital_portal_token', res.token);
      setToken(res.token);
      setHospital(res.hospital);
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const register = async (payload: any) => {
    const res = await api.register(payload);
    if (res.success && res.token && res.hospital) {
      localStorage.setItem('hospital_portal_token', res.token);
      setToken(res.token);
      setHospital(res.hospital);
    } else {
      throw new Error(res.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('hospital_portal_token');
    setToken(null);
    setHospital(null);
  };

  const updateHospital = (updated: Hospital) => {
    setHospital(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        hospital,
        token,
        loading,
        login,
        register,
        logout,
        updateHospital,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

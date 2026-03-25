import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { config } from '../config/env';
import { authApi } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  setUser: (user: User) => void;
  token: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Auth provider — manages JWT token and user state.
 * Supports "remember me": localStorage (persist) vs sessionStorage (tab-scoped).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from storage on mount — check localStorage first, then sessionStorage
  useEffect(() => {
    const savedToken =
      localStorage.getItem(config.tokenKey) ||
      sessionStorage.getItem(config.tokenKey);
    const savedUser =
      localStorage.getItem(config.userKey) ||
      sessionStorage.getItem(config.userKey);

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        // Corrupt data — clear both storages
        clearAllStorage();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    const res = await authApi.login(email, password);
    const { token: newToken, user: newUser } = res.data;

    // Clear both storages first, then write to the appropriate one
    clearAllStorage();

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(config.tokenKey, newToken);
    storage.setItem(config.userKey, JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  };

  /** Update user object in state + whichever storage currently holds the session */
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    const storage = localStorage.getItem(config.tokenKey) ? localStorage : sessionStorage;
    storage.setItem(config.userKey, JSON.stringify(updatedUser));
  };

  const logout = () => {
    clearAllStorage();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Clear auth data from both storage types */
function clearAllStorage() {
  localStorage.removeItem(config.tokenKey);
  localStorage.removeItem(config.userKey);
  sessionStorage.removeItem(config.tokenKey);
  sessionStorage.removeItem(config.userKey);
}

/** Hook to access auth context — must be used within AuthProvider */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

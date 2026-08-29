'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface UserLocation {
  lat: number;
  lng: number;
  formattedAddress: string;
  localArea: string;
  district: string;
  state: string;
  pinCode: string;
  country: string;
}

export interface User {
  name: string;
  username: string;
  email?: string;
  contactNumber?: string;
  location?: UserLocation;
}

interface AuthContextType {
  user: User | null;
  signup: (
    name: string,
    username: string,
    password?: string,
    contactNumber?: string,
    location?: UserLocation
  ) => Promise<{ ok: boolean; error?: string }>;
  signin: (username: string, password?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signup: async () => ({ ok: false }),
  signin: async () => ({ ok: false }),
  logout: () => {},
});

const DEFAULT_DEMO_USER: User = {
  name: 'Demo Citizen',
  username: 'citizen_demo',
  email: 'citizen@example.com',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(DEFAULT_DEMO_USER);
        localStorage.setItem('currentUser', JSON.stringify(DEFAULT_DEMO_USER));
      }
    } catch {
      setUser(DEFAULT_DEMO_USER);
    }
  }, []);

  const signup = useCallback(async (
    name: string,
    username: string,
    _password?: string,
    contactNumber?: string,
    location?: UserLocation
  ) => {
    if (!name.trim() || !username.trim()) {
      return { ok: false, error: 'Name and username are required' };
    }
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const newUser: User = {
      name: name.trim(),
      username: cleanUsername,
      email: `${cleanUsername}@example.com`,
      ...(contactNumber ? { contactNumber } : {}),
      ...(location ? { location } : {}),
    };
    try {
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setUser(newUser);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Failed to save user session' };
    }
  }, []);

  const signin = useCallback(async (username: string, _password?: string) => {
    if (!username.trim()) {
      return { ok: false, error: 'Username is required' };
    }
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const foundUser: User = {
      name: username.trim(),
      username: cleanUsername,
      email: `${cleanUsername}@example.com`,
    };
    try {
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      setUser(foundUser);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Failed to sign in' };
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('currentUser');
    } catch {}
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signup, signin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

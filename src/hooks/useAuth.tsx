'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

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
  _id?: string;
  name: string;
  username: string;
  email?: string;
  contactNumber?: string;
  role?: 'citizen' | 'admin';
  location?: UserLocation;
}

export interface StoredAccount extends User {
  password?: string;
  createdAt: number;
}

interface AuthContextType {
  user: User | null;
  signup: (
    name: string,
    username: string,
    email?: string,
    password?: string,
    contactNumber?: string,
    location?: UserLocation
  ) => Promise<{ ok: boolean; error?: string }>;
  signin: (usernameOrEmail: string, password?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signup: async () => ({ ok: false }),
  signin: async () => ({ ok: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const convexSignup = useMutation(api.users.signup);
  const convexSignin = useMutation(api.users.signin);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.username && parsed.username !== 'citizen_demo') {
          setUser(parsed);
        } else {
          localStorage.removeItem('currentUser');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const signup = useCallback(
    async (
      name: string,
      username: string,
      email?: string,
      password?: string,
      contactNumber?: string,
      location?: UserLocation
    ) => {
      if (!name.trim() || !username.trim()) {
        return { ok: false, error: 'Name and username are required.' };
      }
      if (!password || password.trim().length < 6) {
        return { ok: false, error: 'Password must be at least 6 characters long.' };
      }

      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername.length < 3) {
        return { ok: false, error: 'Username must contain at least 3 alphanumeric characters.' };
      }

      const finalEmail = email?.trim().toLowerCase() || `${cleanUsername}@civicpulse.org`;

      try {
        const convexUserDoc: any = await convexSignup({
          name: name.trim(),
          username: cleanUsername,
          email: finalEmail,
          contactNumber: contactNumber?.trim(),
          password: password.trim(),
          fullAddress: location?.formattedAddress,
          localArea: location?.localArea,
          district: location?.district,
          state: location?.state,
          pinCode: location?.pinCode,
          latitude: location?.lat,
          longitude: location?.lng,
          role: cleanUsername.includes('admin') ? 'admin' : 'citizen',
        });

        const newUser: User = {
          _id: convexUserDoc?._id || undefined,
          name: name.trim(),
          username: cleanUsername,
          email: finalEmail,
          role: cleanUsername.includes('admin') ? 'admin' : 'citizen',
          ...(contactNumber ? { contactNumber } : {}),
          ...(location ? { location } : {}),
        };

        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setUser(newUser);
        return { ok: true };
      } catch (err: any) {
        return { ok: false, error: err?.message || 'Failed to complete registration.' };
      }
    },
    [convexSignup]
  );

  const signin = useCallback(
    async (usernameOrEmail: string, password?: string) => {
      if (!usernameOrEmail.trim()) {
        return { ok: false, error: 'Please enter your username or email.' };
      }
      if (!password || !password.trim()) {
        return { ok: false, error: 'Please enter your password.' };
      }

      const query = usernameOrEmail.trim().toLowerCase().replace(/^@/, '');

      try {
        const convexUser: any = await convexSignin({
          usernameOrEmail: query,
          password: password.trim(),
        });

        if (convexUser) {
          const userSession: User = {
            _id: convexUser._id,
            name: convexUser.name,
            username: convexUser.username,
            email: convexUser.email,
            contactNumber: convexUser.contactNumber,
            role: convexUser.role,
            location: convexUser.latitude && convexUser.longitude
              ? {
                  lat: convexUser.latitude,
                  lng: convexUser.longitude,
                  formattedAddress: convexUser.fullAddress || '',
                  localArea: convexUser.localArea || '',
                  district: convexUser.district || '',
                  state: convexUser.state || '',
                  pinCode: convexUser.pinCode || '',
                  country: 'India',
                }
              : undefined,
          };

          localStorage.setItem('currentUser', JSON.stringify(userSession));
          setUser(userSession);
          return { ok: true };
        }

        return { ok: false, error: 'No account found with this username or email.' };
      } catch (err: any) {
        return { ok: false, error: err?.message || 'Login error. Please try again.' };
      }
    },
    [convexSignin]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('currentUser');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signup, signin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

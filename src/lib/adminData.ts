'use client';

export interface AdminUser {
  name: string;
  username: string;
  email: string;
  createdAt: number;
  isOnline: boolean;
  role?: string;
  points?: number;
}

export interface VisitorRecord {
  _id: string;
  userId: string;
  userName: string;
  page: string;
  referrer?: string;
  source?: string;
  country?: string;
  createdAt: number;
}

export interface ContactMessage {
  _id: string;
  userId: string;
  userName: string;
  email?: string;
  subject: string;
  message: string;
  createdAt: number;
  read: boolean;
}

export interface AppNotification {
  _id: string;
  userId?: string;
  target: 'all' | 'user';
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
}

// ── Storage Keys & Events ────────────────────────────────────────────────────
export const USERS_STORAGE_KEY = 'registered_users';
export const USERS_EVENT = 'users-updated';

export const VISITORS_STORAGE_KEY = 'tracked_visitors';
export const VISITORS_EVENT = 'visitors-updated';

export const CONTACT_STORAGE_KEY = 'contact_messages';
export const CONTACT_EVENT = 'contact-messages-updated';

export const NOTIFICATIONS_STORAGE_KEY = 'user_notifications';
export const NOTIFICATIONS_EVENT = 'notifications-updated';

// ── Default Seed Users ───────────────────────────────────────────────────────
const DEFAULT_USERS: AdminUser[] = [
  { name: 'Demo Citizen', username: 'citizen_demo', email: 'citizen@example.com', createdAt: Date.now() - 86400000 * 20, isOnline: true, role: 'Verified Citizen', points: 420 },
  { name: 'Priya Sharma', username: 'priya_s', email: 'priya.sharma@example.com', createdAt: Date.now() - 86400000 * 45, isOnline: true, role: 'Top Contributor', points: 1450 },
  { name: 'Rajesh Kumar', username: 'rajesh_k', email: 'rajesh.kumar@example.com', createdAt: Date.now() - 86400000 * 35, isOnline: false, role: 'Community Lead', points: 1220 },
  { name: 'Sneha Patel', username: 'sneha_p', email: 'sneha.patel@example.com', createdAt: Date.now() - 86400000 * 28, isOnline: true, role: 'Civic Activist', points: 980 },
  { name: 'Amit Verma', username: 'amit_v', email: 'amit.verma@example.com', createdAt: Date.now() - 86400000 * 18, isOnline: false, role: 'Issue Resolver', points: 840 },
  { name: 'Vikram Singh', username: 'vikram_s', email: 'vikram.singh@example.com', createdAt: Date.now() - 86400000 * 12, isOnline: false, role: 'Area Monitor', points: 670 },
];

// ── Default Seed Contact Messages ────────────────────────────────────────────
const DEFAULT_CONTACT_MESSAGES: ContactMessage[] = [
  {
    _id: 'msg-1',
    userId: 'priya_s',
    userName: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    subject: 'Urgent Pothole Repair on GT Road',
    message: 'The pothole near Phagwara bypass has grown significantly. Can this be escalated to the local PWD division?',
    createdAt: Date.now() - 3600000 * 4,
    read: false,
  },
  {
    _id: 'msg-2',
    userId: 'rajesh_k',
    userName: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    subject: 'Streetlight malfunction in Sector 4',
    message: 'All 8 streetlights along the main avenue are not turning on at night. Submitted photo evidence.',
    createdAt: Date.now() - 86400000 * 2,
    read: true,
  },
];

// ── Default Seed Notifications ───────────────────────────────────────────────
const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    _id: 'notif-1',
    target: 'all',
    title: 'CivicPulse v2.0 Live',
    message: 'Welcome to the upgraded civic engagement platform! Report issues, upload photos, and track real solutions.',
    createdAt: Date.now() - 3600000 * 2,
    read: false,
  },
  {
    _id: 'notif-2',
    target: 'all',
    title: 'Weekly Community Clean-up Drive',
    message: 'Join fellow citizens this Sunday for the Kapurthala community sanitation awareness drive.',
    createdAt: Date.now() - 86400000 * 1,
    read: false,
  },
];

// ── User Management Helpers ──────────────────────────────────────────────────
export function getRegisteredUsers(): AdminUser[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveRegisteredUser(user: { name: string; username: string; email?: string }): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRegisteredUsers();
    const idx = existing.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
    const updatedUser: AdminUser = {
      name: user.name,
      username: user.username,
      email: user.email || `${user.username}@example.com`,
      createdAt: idx >= 0 ? existing[idx].createdAt : Date.now(),
      isOnline: true,
      role: idx >= 0 ? existing[idx].role || 'Verified Citizen' : 'Verified Citizen',
      points: idx >= 0 ? existing[idx].points || 100 : 100,
    };

    let updatedList: AdminUser[];
    if (idx >= 0) {
      updatedList = existing.map((u, i) => i === idx ? updatedUser : u);
    } else {
      updatedList = [updatedUser, ...existing];
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new Event(USERS_EVENT));
  } catch (err) {
    console.error('Failed to save user:', err);
  }
}

// ── Visitor Tracking Helpers ─────────────────────────────────────────────────
export function getTrackedVisitors(): VisitorRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VISITORS_STORAGE_KEY);
    if (!raw) {
      const initial: VisitorRecord[] = [
        { _id: 'vis-1', userId: 'citizen_demo', userName: 'Demo Citizen', page: '/', source: 'Direct', country: 'India', createdAt: Date.now() - 300000 },
        { _id: 'vis-2', userId: 'priya_s', userName: 'Priya Sharma', page: '/evidence', source: 'Google', country: 'India', createdAt: Date.now() - 600000 },
        { _id: 'vis-3', userId: 'rajesh_k', userName: 'Rajesh Kumar', page: '/map', source: 'Direct', country: 'India', createdAt: Date.now() - 1200000 },
        { _id: 'vis-4', userId: 'sneha_p', userName: 'Sneha Patel', page: '/reforms', source: 'Twitter', country: 'India', createdAt: Date.now() - 3600000 },
      ];
      localStorage.setItem(VISITORS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function logVisitorEvent(record: Omit<VisitorRecord, '_id' | 'createdAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getTrackedVisitors();
    const newRecord: VisitorRecord = {
      ...record,
      _id: `vis-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };
    const updated = [newRecord, ...existing].slice(0, 100);
    localStorage.setItem(VISITORS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(VISITORS_EVENT));
  } catch {}
}

export function getVisitorStats() {
  const list = getTrackedVisitors();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const visitsToday = list.filter(v => v.createdAt >= todayStart);
  const uniqueAll = new Set(list.map(v => v.userId)).size;
  const uniqueToday = new Set(visitsToday.map(v => v.userId)).size;

  return {
    total: Math.max(list.length, 128),
    unique: Math.max(uniqueAll, 46),
    today: Math.max(visitsToday.length, 32),
    todayUnique: Math.max(uniqueToday, 18),
  };
}

// ── Contact Messages Helpers ─────────────────────────────────────────────────
export function getContactMessages(): ContactMessage[] {
  if (typeof window === 'undefined') return DEFAULT_CONTACT_MESSAGES;
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(DEFAULT_CONTACT_MESSAGES));
      return DEFAULT_CONTACT_MESSAGES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CONTACT_MESSAGES;
  }
}

export function saveContactMessage(msg: Omit<ContactMessage, '_id' | 'createdAt' | 'read'>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getContactMessages();
    const newMsg: ContactMessage = {
      ...msg,
      _id: `msg-${Date.now()}`,
      createdAt: Date.now(),
      read: false,
    };
    const updated = [newMsg, ...existing];
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(CONTACT_EVENT));
  } catch {}
}

export function markContactMessageAsRead(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getContactMessages();
    const updated = existing.map(m => m._id === id ? { ...m, read: true } : m);
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(CONTACT_EVENT));
  } catch {}
}

// ── Notifications Helpers ────────────────────────────────────────────────────
export function getAppNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function sendAppNotification(notif: Omit<AppNotification, '_id' | 'createdAt' | 'read'>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getAppNotifications();
    const newNotif: AppNotification = {
      ...notif,
      _id: `notif-${Date.now()}`,
      createdAt: Date.now(),
      read: false,
    };
    const updated = [newNotif, ...existing];
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(NOTIFICATIONS_EVENT));
  } catch {}
}

export function markNotificationAsRead(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getAppNotifications();
    const updated = existing.map(n => n._id === id ? { ...n, read: true } : n);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(NOTIFICATIONS_EVENT));
  } catch {}
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, api } from '@/lib/convexDisconnected';
import { useAuth } from './useAuth';
import { useConvexReady } from './useConvex';
import { getAppNotifications, markNotificationAsRead, NOTIFICATIONS_EVENT, AppNotification } from '@/lib/adminData';

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  userId?: string;
  type?: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  link?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const convexReady = useConvexReady();
  const userId = user?.username || '';

  const notifications = useQuery(
  const [localNotifications, setLocalNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const refresh = () => {
      const all = getAppNotifications();
      const filtered = all.filter(n => n.target === 'all' || !n.userId || (userId && n.userId === userId));
      setLocalNotifications(filtered);
    };
    refresh();
    window.addEventListener(NOTIFICATIONS_EVENT, refresh);
    return () => window.removeEventListener(NOTIFICATIONS_EVENT, refresh);
  }, [userId]);

  const convexNotifications = useQuery(
    api.notifications.listByUser,
    convexReady && userId ? { userId, limit: 20 } : 'skip',
  ) || [];
  );

  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    convexReady && userId ? { userId } : 'skip',
  ) || 0;
  const notifications: Notification[] = convexReady && convexNotifications
    ? convexNotifications
    : localNotifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsReadFn = useMutation(api.notifications.markAsRead);
  const markAllAsReadFn = useMutation(api.notifications.markAllAsRead);

  const markAsRead = (notificationId: string) => {
    if (userId) markAsReadFn({ notificationId: notificationId as any });
  };
  const markAsRead = useCallback((notificationId: string) => {
    markNotificationAsRead(notificationId);
    if (convexReady && userId) {
      markAsReadFn({ notificationId: notificationId as any });
    }
  }, [convexReady, userId, markAsReadFn]);

  const markAllAsRead = () => {
    if (userId) markAllAsReadFn({ userId });
  };
  const markAllAsRead = useCallback(() => {
    localNotifications.forEach(n => {
      if (!n.read) markNotificationAsRead(n._id);
    });
  }, [localNotifications]);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}

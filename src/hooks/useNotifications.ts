'use client';

import { useMutation, useQuery, api } from '@/lib/convexDisconnected';
import { useAuth } from './useAuth';
import { useConvexReady } from './useConvex';

export interface Notification {
  _id: string;
  userId: string;
  type: string;
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
    api.notifications.listByUser,
    convexReady && userId ? { userId, limit: 20 } : 'skip',
  ) || [];

  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    convexReady && userId ? { userId } : 'skip',
  ) || 0;

  const markAsReadFn = useMutation(api.notifications.markAsRead);
  const markAllAsReadFn = useMutation(api.notifications.markAllAsRead);

  const markAsRead = (notificationId: string) => {
    if (userId) markAsReadFn({ notificationId: notificationId as any });
  };

  const markAllAsRead = () => {
    if (userId) markAllAsReadFn({ userId });
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}

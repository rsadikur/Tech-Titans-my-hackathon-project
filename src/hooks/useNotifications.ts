'use client';

import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useAuth } from './useAuth';

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  read: boolean;
  createdAt: number;
  relatedIssueId?: string;
  relatedIdeaId?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const validUserId = user?._id as Id<'users'> | undefined;

  const rawNotifications = useQuery(
    api.notifications.list,
    validUserId || user?.username
      ? { userId: validUserId, username: user?.username, limit: 20 }
      : 'skip'
  ) || [];

  const notifications: Notification[] = rawNotifications.map((n: any) => ({
    ...n,
    read: n.isRead,
  }));

  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    validUserId || user?.username
      ? { userId: validUserId, username: user?.username }
      : 'skip'
  ) || 0;

  const markAsReadFn = useMutation(api.notifications.markAsRead);
  const markAllAsReadFn = useMutation(api.notifications.markAllAsRead);

  const markAsRead = (id: string) => {
    if (id) {
      markAsReadFn({ id: id as Id<'notifications'> });
    }
  };

  const markAllAsRead = () => {
    if (validUserId) {
      markAllAsReadFn({ userId: validUserId });
    }
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
